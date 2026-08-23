package controllers

import (
	"github.com/gofiber/fiber/v2"
	
	"kalvixnexus/backend/tenant/middlewares"
	"kalvixnexus/backend/tenant/models"
)

// GetProducts returns a list of products for the current tenant
func GetProducts(c *fiber.Ctx) error {
	db := middlewares.GetTenantDB(c)
	if db == nil {
		return c.Status(500).JSON(fiber.Map{"error": "Database connection not found"})
	}

	var products []models.Product
	if err := db.Find(&products).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}

	return c.JSON(products)
}

// CreateProduct creates a new product for the current tenant
func CreateProduct(c *fiber.Ctx) error {
	db := middlewares.GetTenantDB(c)
	if db == nil {
		return c.Status(500).JSON(fiber.Map{"error": "Database connection not found"})
	}

	product := new(models.Product)
	if err := c.BodyParser(product); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request body"})
	}

	if err := db.Create(product).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}

	return c.JSON(product)
}

// GetProductBySlug returns a single product by its slug
func GetProductBySlug(c *fiber.Ctx) error {
	db := middlewares.GetTenantDB(c)
	if db == nil {
		return c.Status(500).JSON(fiber.Map{"error": "Database connection not found"})
	}

	slug := c.Params("slug")
	var product models.Product
	if err := db.Where("slug = ?", slug).First(&product).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Product not found"})
	}

	return c.JSON(product)
}
