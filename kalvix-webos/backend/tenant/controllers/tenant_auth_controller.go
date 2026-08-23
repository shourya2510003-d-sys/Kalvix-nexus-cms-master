package controllers

import (
	"strings"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"

	"kalvixnexus/backend/platform/db"
	platformModels "kalvixnexus/backend/platform/models"
	"kalvixnexus/backend/tenant/middlewares"
	"kalvixnexus/backend/tenant/models"
)

type CustomerLoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

// CustomerLogin handles Customer login against the isolated Tenant DB
func CustomerLogin(c *fiber.Ctx) error {
	var req CustomerLoginRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid input"})
	}

	tenantDB := middlewares.GetTenantDB(c)
	if tenantDB == nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Tenant database not found in context"})
	}

	var user models.User
	if err := tenantDB.Where("email = ?", req.Email).First(&user).Error; err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Invalid credentials"})
	}

	if err := user.CheckPassword(req.Password); err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Invalid credentials"})
	}

	// Removed role restriction so admins can log in too

	// Figure out which tenant this is so we can get its JWT Secret
	subdomain := c.Get("X-Tenant-Subdomain")
	host := c.Hostname()
	if subdomain == "" {
		parts := strings.Split(host, ".")
		subdomain = host
		if len(parts) >= 3 {
			subdomain = parts[0]
		}
	}

	var tenant platformModels.Tenant
	if err := db.MainDB.Where("subdomain = ? OR domain = ?", subdomain, host).First(&tenant).Error; err != nil {
		// Fallback to domain parsing logic from resolver if needed, but keeping it simple here
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Could not identify tenant secret"})
	}

	// Use the tenant's specific JWT secret, or fallback to global if they don't have one set
	secret := tenant.JWTSecret
	if secret == "" {
		// Use global fallback for now if no custom secret is defined
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Tenant JWT secret not configured"})
	}

	// Create claims
	claims := jwt.MapClaims{
		"user_id":     user.ID, // UUID string from legacy DB
		"email":       user.Email,
		"role":        user.Role,
		"auth_type":   "tenant",
		"tenant_slug": tenant.Subdomain,
		"exp":         time.Now().Add(time.Hour * 72).Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	t, err := token.SignedString([]byte(secret))
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Could not login"})
	}

	return c.JSON(fiber.Map{
		"token": t,
		"user": fiber.Map{
			"id":         user.ID,
			"email":      user.Email,
			"role":       user.Role,
			"first_name": user.FirstName,
			"last_name":  user.LastName,
		},
	})
}
