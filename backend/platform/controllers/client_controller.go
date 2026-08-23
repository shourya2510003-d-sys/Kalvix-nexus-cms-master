package controllers

import (
	"github.com/gofiber/fiber/v2"

	"kalvixnexus/backend/platform/db"
	"kalvixnexus/backend/platform/models"
)

// GetClients returns all clients
func GetClients(c *fiber.Ctx) error {
	var clients []models.Client
	if err := db.MainDB.Find(&clients).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(clients)
}

// CreateClient creates a new client
func CreateClient(c *fiber.Ctx) error {
	client := new(models.Client)
	if err := c.BodyParser(client); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request body"})
	}

	if err := db.MainDB.Create(client).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(client)
}
