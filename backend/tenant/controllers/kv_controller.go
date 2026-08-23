package controllers

import (
	"encoding/json"
	"time"

	"github.com/gofiber/fiber/v2"
	"kalvixnexus/backend/tenant/middlewares"
)

type SystemSetting struct {
	Key         string    `gorm:"primarykey;column:key"`
	Value       string    `gorm:"column:value"`
	Description string    `gorm:"column:description"`
	UpdatedAt   time.Time `gorm:"column:updatedAt"`
}

func (SystemSetting) TableName() string {
	return "SystemSetting"
}

// GetKV fetches a value by key
func GetKV(c *fiber.Ctx) error {
	db := middlewares.GetTenantDB(c)
	if db == nil {
		return c.Status(500).JSON(fiber.Map{"error": "Tenant DB not available"})
	}
	
	key := c.Params("key")

	var setting SystemSetting
	if err := db.Where("key = ?", key).First(&setting).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Key not found"})
	}

	var parsedValue interface{}
	if err := json.Unmarshal([]byte(setting.Value), &parsedValue); err != nil {
		// If it's not valid JSON, return as string
		return c.JSON(setting.Value)
	}

	return c.JSON(parsedValue)
}

// SetKV creates or updates a key-value pair
func SetKV(c *fiber.Ctx) error {
	db := middlewares.GetTenantDB(c)
	if db == nil {
		return c.Status(500).JSON(fiber.Map{"error": "Tenant DB not available"})
	}
	
	key := c.Params("key")

	var requestBody interface{}
	if err := c.BodyParser(&requestBody); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": err.Error()})
	}

	jsonBytes, err := json.Marshal(requestBody)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to marshal JSON"})
	}

	setting := SystemSetting{
		Key:       key,
		Value:     string(jsonBytes),
		UpdatedAt: time.Now(),
	}

	// Upsert
	if err := db.Save(&setting).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}

	return c.JSON(fiber.Map{"message": "success"})
}
