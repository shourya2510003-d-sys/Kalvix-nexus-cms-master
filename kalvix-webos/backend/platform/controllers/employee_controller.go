package controllers

import (
	"github.com/gofiber/fiber/v2"

	"kalvixnexus/backend/platform/db"
	"kalvixnexus/backend/platform/models"
)

// GetEmployees returns all employees
func GetEmployees(c *fiber.Ctx) error {
	var employees []models.Employee
	if err := db.MainDB.Preload("User").Find(&employees).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(employees)
}

// CreateEmployee creates a new employee
func CreateEmployee(c *fiber.Ctx) error {
	employee := new(models.Employee)
	if err := c.BodyParser(employee); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request body"})
	}

	if err := db.MainDB.Create(employee).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(employee)
}
