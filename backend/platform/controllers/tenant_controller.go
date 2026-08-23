package controllers

import (
	"github.com/gofiber/fiber/v2"

	"kalvixnexus/backend/platform/db"
	"kalvixnexus/backend/platform/models"
)

// GetTenants returns a list of all tenants (SuperAdmin only)
func GetTenants(c *fiber.Ctx) error {
	var tenants []models.Tenant
	if err := db.MainDB.Find(&tenants).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to fetch tenants"})
	}
	return c.JSON(tenants)
}

// UpdateTenantStatus activates or suspends a tenant (SuperAdmin only)
func UpdateTenantStatus(c *fiber.Ctx) error {
	id := c.Params("id")
	
	type UpdateRequest struct {
		Status string `json:"status"` // "active" or "suspended"
	}
	
	var req UpdateRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid request payload"})
	}

	if req.Status != "active" && req.Status != "suspended" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid status value"})
	}

	var tenant models.Tenant
	if err := db.MainDB.First(&tenant, id).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Tenant not found"})
	}

	tenant.Status = req.Status
	if err := db.MainDB.Save(&tenant).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to update tenant status"})
	}

	return c.JSON(fiber.Map{
		"message": "Tenant status updated successfully",
		"tenant":  tenant,
	})
}
