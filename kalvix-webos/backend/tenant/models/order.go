package models

import (
	"time"

	"gorm.io/gorm"
)

type Order struct {
	ID         uint           `gorm:"primarykey" json:"id"`
	CreatedAt  time.Time      `json:"created_at"`
	UpdatedAt  time.Time      `json:"updated_at"`
	DeletedAt  gorm.DeletedAt `gorm:"index" json:"-"`
	
	CustomerID uint           `gorm:"not null" json:"customer_id"`
	Customer   Customer       `json:"customer"`
	
	TotalAmount float64       `gorm:"not null" json:"total_amount"`
	Status      string        `gorm:"default:'pending'" json:"status"` // pending, paid, shipped, cancelled
}

type OrderItem struct {
	ID        uint    `gorm:"primarykey" json:"id"`
	OrderID   uint    `gorm:"not null" json:"order_id"`
	ProductID uint    `gorm:"not null" json:"product_id"`
	Product   Product `json:"product"`
	Quantity  int     `gorm:"not null" json:"quantity"`
	Price     float64 `gorm:"not null" json:"price"` // Snapshot of price at time of order
}
