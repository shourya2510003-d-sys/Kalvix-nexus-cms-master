package handlers

import (
	"encoding/json"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
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
func GetKV(c *gin.Context) {
	db := c.MustGet("tenantDB").(*gorm.DB)
	key := c.Param("key")

	var setting SystemSetting
	if err := db.Where("key = ?", key).First(&setting).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Key not found"})
		return
	}

	var parsedValue interface{}
	if err := json.Unmarshal([]byte(setting.Value), &parsedValue); err != nil {
		// If it's not valid JSON, return as string
		c.JSON(http.StatusOK, setting.Value)
		return
	}

	c.JSON(http.StatusOK, parsedValue)
}

// SetKV creates or updates a key-value pair
func SetKV(c *gin.Context) {
	db := c.MustGet("tenantDB").(*gorm.DB)
	key := c.Param("key")

	var requestBody interface{}
	if err := c.ShouldBindJSON(&requestBody); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	jsonBytes, err := json.Marshal(requestBody)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to marshal JSON"})
		return
	}

	setting := SystemSetting{
		Key:       key,
		Value:     string(jsonBytes),
		UpdatedAt: time.Now(),
	}

	// Upsert
	if err := db.Save(&setting).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "success"})
}
