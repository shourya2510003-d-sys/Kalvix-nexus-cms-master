package models

import (
	"time"

	"gorm.io/gorm"
)

type Attendance struct {
	ID         uint           `gorm:"primarykey" json:"id"`
	CreatedAt  time.Time      `json:"created_at"`
	UpdatedAt  time.Time      `json:"updated_at"`
	DeletedAt  gorm.DeletedAt `gorm:"index" json:"-"`
	
	EmployeeID uint           `gorm:"not null" json:"employee_id"`
	Employee   Employee       `json:"employee"`
	
	Date       time.Time      `gorm:"type:date;not null" json:"date"`
	CheckIn    time.Time      `json:"check_in"`
	CheckOut   *time.Time     `json:"check_out,omitempty"`
	Status     string         `gorm:"default:'present'" json:"status"` // present, absent, half-day, leave
	Notes      string         `json:"notes"`
}
