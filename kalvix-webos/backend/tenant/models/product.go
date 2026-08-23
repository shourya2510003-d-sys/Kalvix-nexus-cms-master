package models

import (
	"time"
)

// Product maps exactly to the Prisma schema imported from the legacy backend
type Product struct {
	ID             string    `gorm:"primarykey;column:id" json:"id"`
	Name           string    `gorm:"column:name" json:"name"`
	Slug           string    `gorm:"unique;column:slug" json:"slug"`
	Description    string    `gorm:"column:description" json:"description"`
	Summary        *string   `gorm:"column:summary" json:"summary"`
	KeyIngredients *string   `gorm:"column:keyIngredients" json:"keyIngredients"`
	HowToUse       *string   `gorm:"column:howToUse" json:"howToUse"`
	Status         string    `gorm:"column:status" json:"status"`
	Rating         float64   `gorm:"column:rating" json:"rating"`
	BasePrice      float64   `gorm:"column:basePrice" json:"basePrice"`
	CreatedAt      time.Time `gorm:"column:createdAt" json:"createdAt"`
	UpdatedAt      time.Time `gorm:"column:updatedAt" json:"updatedAt"`
}

// TableName overrides the table name used by Gorm to match Prisma exactly
func (Product) TableName() string {
	return "Product"
}
