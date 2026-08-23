package models

import (
	"time"

	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

type User struct {
	ID        uint           `gorm:"primarykey" json:"id"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`

	Email     string `gorm:"uniqueIndex;not null" json:"email"`
	Password  string `gorm:"not null" json:"-"` // Hashed password
	FirstName string `json:"first_name"`
	LastName  string `json:"last_name"`
	Role      string `gorm:"default:'customer'" json:"role"` // superadmin, tenantadmin, customer

	TenantID  *uint  `json:"tenant_id"` // Null for superadmin
	Tenant    *Tenant `json:"tenant,omitempty"`
}

// HashPassword hashes the user's password using bcrypt
func (u *User) HashPassword(password string) error {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), 14)
	if err != nil {
		return err
	}
	u.Password = string(bytes)
	return nil
}

// CheckPassword verifies a plaintext password against the hash
func (u *User) CheckPassword(providedPassword string) error {
	err := bcrypt.CompareHashAndPassword([]byte(u.Password), []byte(providedPassword))
	if err != nil {
		return err
	}
	return nil
}
