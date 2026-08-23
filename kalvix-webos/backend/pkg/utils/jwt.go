package utils

import (
	"errors"
	"os"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

type Role string

const (
	RoleSuperAdmin  Role = "superadmin"
	RoleTenantAdmin Role = "tenantadmin"
	RoleCustomer    Role = "customer"
)

type JWTClaims struct {
	UserID   string `json:"userId"`
	TenantID string `json:"tenantId"`
	Role     Role   `json:"role"`
	jwt.RegisteredClaims
}

// GenerateToken creates a new JWT token for a specific user and tenant context
func GenerateToken(userID, tenantID string, role Role) (string, error) {
	secret := os.Getenv("JWT_SECRET")
	if secret == "" {
		return "", errors.New("JWT_SECRET environment variable not set")
	}

	claims := JWTClaims{
		UserID:   userID,
		TenantID: tenantID, // Use "*" for SuperAdmin to mean all tenants
		Role:     role,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(24 * time.Hour)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			NotBefore: jwt.NewNumericDate(time.Now()),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(secret))
}

// VerifyToken parses and validates a JWT token string
func VerifyToken(tokenString string) (*JWTClaims, error) {
	secret := os.Getenv("JWT_SECRET")
	if secret == "" {
		return nil, errors.New("JWT_SECRET environment variable not set")
	}

	token, err := jwt.ParseWithClaims(tokenString, &JWTClaims{}, func(token *jwt.Token) (interface{}, error) {
		return []byte(secret), nil
	})

	if err != nil {
		return nil, err
	}

	if claims, ok := token.Claims.(*JWTClaims); ok && token.Valid {
		return claims, nil
	}

	return nil, errors.New("invalid token")
}
