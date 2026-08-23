package controllers

import (
	"github.com/gofiber/fiber/v2"
	"kalvixnexus/backend/tenant/middlewares"
)

type CmsLayout struct {
	ID        string `gorm:"primaryKey;column:id" json:"id"`
	PageID    string `gorm:"column:pageId;unique" json:"pageId"`
	Config    string `gorm:"column:config;type:jsonb" json:"config"`
}

func (CmsLayout) TableName() string {
	return "CmsLayout"
}

func GetCMSLayout(c *fiber.Ctx) error {
	db := middlewares.GetTenantDB(c)
	if db == nil {
		return c.Status(500).JSON(fiber.Map{"error": "Database connection not found"})
	}

	reference := c.Params("*") 
	
	var layout CmsLayout
	if err := db.Where("\"pageId\" = ?", reference).First(&layout).Error; err != nil {
		// fallback for legacy structure where reference might be ingredients
		return c.Status(404).JSON(fiber.Map{"error": "Layout not found"})
	}

	c.Set("Content-Type", "application/json")
	return c.SendString(layout.Config)
}
