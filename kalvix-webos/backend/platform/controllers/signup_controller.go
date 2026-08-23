package controllers

import (
	"strings"

	"github.com/gofiber/fiber/v2"

	"kalvixnexus/backend/platform/db"
	"kalvixnexus/backend/platform/jobs"
	"kalvixnexus/backend/platform/models"
)

type SignupRequest struct {
	StoreName string `json:"store_name"`
	Subdomain string `json:"subdomain"`
	Name      string `json:"name"`
	Email     string `json:"email"`
	Password  string `json:"password"`
}

// SignupTenant handles the public SaaS registration flow
func SignupTenant(c *fiber.Ctx) error {
	var req SignupRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid request payload"})
	}

	req.Subdomain = strings.ToLower(strings.TrimSpace(req.Subdomain))

	// Validate availability
	var count int64
	db.MainDB.Model(&models.Tenant{}).Where("subdomain = ?", req.Subdomain).Count(&count)
	if count > 0 {
		return c.Status(fiber.StatusConflict).JSON(fiber.Map{"error": "Subdomain already taken"})
	}
	db.MainDB.Model(&models.User{}).Where("email = ?", req.Email).Count(&count)
	if count > 0 {
		return c.Status(fiber.StatusConflict).JSON(fiber.Map{"error": "Email already in use"})
	}

	// 1. Create the Tenant Record
	tenant := models.Tenant{
		Name:      req.StoreName,
		Subdomain: req.Subdomain,
		DBName:    "tenant_" + req.Subdomain,
		Status:    "provisioning",
	}

	if err := db.MainDB.Create(&tenant).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to create store record"})
	}

	// 2. Create the TenantAdmin User Record
	names := strings.Split(req.Name, " ")
	firstName := names[0]
	lastName := ""
	if len(names) > 1 {
		lastName = strings.Join(names[1:], " ")
	}

	user := models.User{
		Email:     req.Email,
		FirstName: firstName,
		LastName:  lastName,
		Role:      "tenantadmin",
		TenantID:  &tenant.ID,
	}

	if err := user.HashPassword(req.Password); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to process password"})
	}

	if err := db.MainDB.Create(&user).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to create user account"})
	}

	// 3. Trigger Background Provisioning Job
	if err := jobs.EnqueueTenantProvisioning(tenant.ID); err != nil {
		// Log this heavily as the tenant is created but provisioning failed to enqueue
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Store registered but provisioning failed to start"})
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"message": "Store successfully registered and is being provisioned in the background.",
		"tenant":  tenant,
	})
}
