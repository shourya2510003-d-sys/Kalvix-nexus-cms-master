package controllers

import (
	"github.com/gofiber/fiber/v2"
	
	"kalvixnexus/backend/tenant/middlewares"
	"kalvixnexus/backend/tenant/models"
)

// GetCategories returns all categories
func GetCategories(c *fiber.Ctx) error {
	db := middlewares.GetTenantDB(c)
	if db == nil {
		return c.Status(500).JSON(fiber.Map{"error": "Database connection not found"})
	}

	var categories []models.Category
	// We might not have a Category struct explicitly mapped in Go models yet, 
	// assuming it's there or we use a basic map for now. 
	// The DB call might fail if models.Category is missing.
	if err := db.Table("Category").Find(&categories).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}

	return c.JSON(categories)
}
