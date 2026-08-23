package models

import (
	"time"

	"gorm.io/gorm"
)

type Employee struct {
	ID          uint           `gorm:"primarykey" json:"id"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`
	
	UserID      uint           `gorm:"uniqueIndex;not null" json:"user_id"`
	User        User           `json:"user"`
	
	EmployeeID  string         `gorm:"uniqueIndex;not null" json:"employee_id"` // E.g., KN-001
	Department  string         `json:"department"`
	Designation string         `json:"designation"`
	JoinDate    time.Time      `json:"join_date"`
	IsActive    bool           `gorm:"default:true" json:"is_active"`
}
