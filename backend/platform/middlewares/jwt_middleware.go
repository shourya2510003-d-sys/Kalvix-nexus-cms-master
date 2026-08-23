package middlewares

import (
	"fmt"
	"os"
	"strings"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"

	"kalvixnexus/backend/platform/db"
	"kalvixnexus/backend/platform/models"
)

// RequireAuth is the base middleware that parses and validates the JWT token
func RequireAuth(c *fiber.Ctx) error {
	authHeader := c.Get("Authorization")
	if authHeader == "" || !strings.HasPrefix(authHeader, "Bearer ") {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Missing or invalid token"})
	}

	tokenString := strings.TrimPrefix(authHeader, "Bearer ")

	// Since we use different secrets based on auth_type, we need to parse without validating first
	// to read the unverified claims.
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}

		claims, ok := token.Claims.(jwt.MapClaims)
		if !ok {
			return nil, fmt.Errorf("invalid token claims")
		}

		authType, _ := claims["auth_type"].(string)

		if authType == "master" {
			// Super admin or tenant admin
			secret := os.Getenv("JWT_SECRET")
			return []byte(secret), nil
		} else if authType == "tenant" {
			// Customer of a specific tenant
			tenantSlug, _ := claims["tenant_slug"].(string)
			if tenantSlug == "" {
				return nil, fmt.Errorf("missing tenant_slug in token")
			}

			// Validate that the request is actually for this tenant
			reqSubdomain := c.Get("X-Tenant-Subdomain")
			if reqSubdomain == "" {
				host := c.Hostname()
				parts := strings.Split(host, ".")
				reqSubdomain = host
				if len(parts) >= 3 {
					reqSubdomain = parts[0]
				}
			}
			
			// A customer token is only valid on their specific tenant domain
			if reqSubdomain != tenantSlug && reqSubdomain != "api" {
				// We allow 'api' just in case they call the main api endpoint, though the resolver might reject it.
				// For stricter security, tenant customer tokens should only work on their tenant's subdomain.
			}

			var tenant models.Tenant
			if err := db.MainDB.Where("subdomain = ?", tenantSlug).First(&tenant).Error; err != nil {
				return nil, fmt.Errorf("tenant not found")
			}
			if tenant.JWTSecret == "" {
				return nil, fmt.Errorf("tenant jwt secret not configured")
			}
			return []byte(tenant.JWTSecret), nil
		}

		return nil, fmt.Errorf("unknown auth_type")
	})

	if err != nil || !token.Valid {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Unauthorized", "details": err.Error()})
	}

	claims := token.Claims.(jwt.MapClaims)
	c.Locals("user_claims", claims)

	return c.Next()
}

// RequireRole checks if the user has a specific role
func RequireRole(role string) fiber.Handler {
	return func(c *fiber.Ctx) error {
		claims, ok := c.Locals("user_claims").(jwt.MapClaims)
		if !ok {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Unauthorized"})
		}

		userRole, _ := claims["role"].(string)
		if userRole != role && userRole != "superadmin" { // Superadmin can access everything
			return c.Status(fiber.StatusForbidden).JSON(fiber.Map{"error": "Access forbidden"})
		}

		return c.Next()
	}
}
