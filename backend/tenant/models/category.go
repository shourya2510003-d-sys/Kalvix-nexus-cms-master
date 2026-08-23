package models

import (
	"time"
)

// Category maps exactly to the Prisma schema imported from the legacy backend
type Category struct {
	ID          string    `gorm:"primarykey;column:id" json:"id"`
	Name        string    `gorm:"column:name" json:"name"`
	Slug        string    `gorm:"unique;column:slug" json:"slug"`
	Description *string   `gorm:"column:description" json:"description"`
	Image       *string   `gorm:"column:image" json:"image"`
	CreatedAt   time.Time `gorm:"column:createdAt" json:"createdAt"`
	UpdatedAt   time.Time `gorm:"column:updatedAt" json:"updatedAt"`
}

// TableName overrides the table name used by Gorm to match Prisma exactly
func (Category) TableName() string {
	return "Category"
}
