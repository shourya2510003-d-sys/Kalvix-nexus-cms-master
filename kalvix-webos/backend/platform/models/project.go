package models

import (
	"time"

	"gorm.io/gorm"
)

type Project struct {
	ID          uint           `gorm:"primarykey" json:"id"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`
	
	Name        string         `gorm:"not null" json:"name"`
	Description string         `json:"description"`
	
	ClientID    uint           `json:"client_id"`
	Client      Client         `json:"client"`
	
	Status      string         `gorm:"default:'planning'" json:"status"` // planning, in-progress, completed, on-hold
	Deadline    *time.Time     `json:"deadline,omitempty"`
}

type ProjectAssignment struct {
	ID         uint       `gorm:"primarykey" json:"id"`
	ProjectID  uint       `gorm:"not null" json:"project_id"`
	Project    Project    `json:"project"`
	
	EmployeeID uint       `gorm:"not null" json:"employee_id"`
	Employee   Employee   `json:"employee"`
	
	Role       string     `json:"role"` // lead, developer, designer
	AssignedAt time.Time  `json:"assigned_at"`
}
