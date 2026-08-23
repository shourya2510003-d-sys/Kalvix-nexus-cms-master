package controllers

import (
	"os"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"

	"kalvixnexus/backend/platform/db"
	"kalvixnexus/backend/platform/models"
)

type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

// MasterLogin handles Super Admin and Tenant Admin login against the Master DB
func MasterLogin(c *fiber.Ctx) error {
	var req LoginRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid input"})
	}

	var user models.User
	// Preload tenant to get the tenant's slug/subdomain if it's a tenant admin
	if err := db.MainDB.Preload("Tenant").Where("email = ?", req.Email).First(&user).Error; err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Invalid credentials"})
	}

	if err := user.CheckPassword(req.Password); err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Invalid credentials"})
	}

	if user.Role != "superadmin" && user.Role != "tenantadmin" {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{"error": "Access denied"})
	}

	// Create claims
	claims := jwt.MapClaims{
		"user_id":   user.ID,
		"email":     user.Email,
		"role":      user.Role,
		"auth_type": "master",
		"exp":       time.Now().Add(time.Hour * 72).Unix(),
	}

	// If tenant admin, add tenant info to JWT
	if user.Role == "tenantadmin" && user.Tenant != nil {
		claims["tenant_id"] = user.Tenant.ID
		claims["tenant_slug"] = user.Tenant.Subdomain
	}

	// Sign token using global JWT secret
	secret := os.Getenv("JWT_SECRET")
	if secret == "" {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "JWT secret not configured"})
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
			"tenant":     user.Tenant,
		},
	})
}
