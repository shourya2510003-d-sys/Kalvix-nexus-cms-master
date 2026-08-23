package models

import (
	"time"

	"golang.org/x/crypto/bcrypt"
)

// User maps to the Prisma User model in the Tenant database (Customers)
type User struct {
	ID            string    `gorm:"primarykey;column:id" json:"id"`
	Email         string    `gorm:"unique;column:email" json:"email"`
	PasswordHash  *string   `gorm:"column:passwordHash" json:"-"`
	Phone         *string   `gorm:"unique;column:phone" json:"phone"`
	FirstName     *string   `gorm:"column:firstName" json:"first_name"`
	LastName      *string   `gorm:"column:lastName" json:"last_name"`
	Role          string    `gorm:"column:role" json:"role"`
	WalletBalance float64   `gorm:"column:walletBalance" json:"wallet_balance"`
	CreatedAt     time.Time `gorm:"column:createdAt" json:"created_at"`
	UpdatedAt     time.Time `gorm:"column:updatedAt" json:"updated_at"`
}

// TableName overrides the table name used by Gorm to match Prisma exactly
func (User) TableName() string {
	return "User"
}

// HashPassword hashes the user's password using bcrypt
func (u *User) HashPassword(password string) error {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), 14)
	if err != nil {
		return err
	}
	hash := string(bytes)
	u.PasswordHash = &hash
	return nil
}

// CheckPassword verifies a plaintext password against the hash
func (u *User) CheckPassword(providedPassword string) error {
	if u.PasswordHash == nil {
		return bcrypt.ErrMismatchedHashAndPassword
	}
	return bcrypt.CompareHashAndPassword([]byte(*u.PasswordHash), []byte(providedPassword))
}
