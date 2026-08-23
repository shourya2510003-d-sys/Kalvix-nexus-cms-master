package models

import (
	"time"

	"gorm.io/gorm"
)

type Tenant struct {
	ID        uint           `gorm:"primarykey" json:"id"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
	
	Name      string `gorm:"uniqueIndex;not null" json:"name"`
	Subdomain string `gorm:"uniqueIndex;not null" json:"subdomain"`
	Domain    string `gorm:"uniqueIndex" json:"domain"`
	DBName    string `gorm:"uniqueIndex;not null" json:"db_name"`
	Status    string `gorm:"default:'active'" json:"status"` // active, suspended
	JWTSecret string `json:"-"`                              // For tenant-specific JWT signing
}

func (Tenant) TableName() string {
	return "tenants"
}
