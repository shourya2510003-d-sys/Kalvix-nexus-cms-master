package models

import (
	"time"

	"gorm.io/gorm"
)

type Subscription struct {
	ID        uint           `gorm:"primarykey" json:"id"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`

	TenantID  uint      `gorm:"uniqueIndex;not null" json:"tenant_id"`
	Tenant    *Tenant   `json:"tenant,omitempty"`

	PlanName  string    `json:"plan_name"`
	Status    string    `gorm:"default:'active'" json:"status"` // active, past_due, canceled
	ValidUntil time.Time `json:"valid_until"`
}
