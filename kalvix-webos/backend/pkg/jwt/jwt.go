package jwt

import (
	"time"

	"github.com/golang-jwt/jwt/v5"
)

var SecretKey = []byte("super-secret-key-change-in-production")

type Claims struct {
	UserID   uint   `json:"user_id"`
	Role     string `json:"role"`
	TenantID *uint  `json:"tenant_id,omitempty"`
	jwt.RegisteredClaims
}

func GenerateToken(userID uint, role string, tenantID *uint) (string, error) {
	expirationTime := time.Now().Add(24 * time.Hour)
	claims := &Claims{
		UserID:   userID,
		Role:     role,
		TenantID: tenantID,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(expirationTime),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(SecretKey)
}

func ValidateToken(tokenString string) (*Claims, error) {
	claims := &Claims{}
	token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
		return SecretKey, nil
	})

	if err != nil || !token.Valid {
		return nil, err
	}

	return claims, nil
}
