package controllers

import (
	"github.com/gofiber/fiber/v2"
	
	"kalvixnexus/backend/tenant/middlewares"
	"kalvixnexus/backend/tenant/models"
)

// GetOrders returns a list of orders for the current customer
func GetOrders(c *fiber.Ctx) error {
	db := middlewares.GetTenantDB(c)
	if db == nil {
		return c.Status(500).JSON(fiber.Map{"error": "Database connection not found"})
	}

	var orders []models.Order
	if err := db.Preload("Customer").Find(&orders).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}

	return c.JSON(orders)
}

// CreateOrder creates a new order
func CreateOrder(c *fiber.Ctx) error {
	db := middlewares.GetTenantDB(c)
	if db == nil {
		return c.Status(500).JSON(fiber.Map{"error": "Database connection not found"})
	}

	order := new(models.Order)
	if err := c.BodyParser(order); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request body"})
	}

	if err := db.Create(order).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}

	return c.JSON(order)
}
