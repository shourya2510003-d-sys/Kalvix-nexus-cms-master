package models

import (
	"time"

	"gorm.io/gorm"
)

type Client struct {
	ID        uint           `gorm:"primarykey" json:"id"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
	
	Name      string         `gorm:"not null" json:"name"`
	Email     string         `gorm:"uniqueIndex;not null" json:"email"`
	Company   string         `json:"company"`
	Phone     string         `json:"phone"`
	Status    string         `gorm:"default:'lead'" json:"status"` // lead, active, past
}
