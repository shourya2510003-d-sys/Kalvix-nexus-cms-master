package middlewares

import (
	"fmt"
	"os"
	"strings"
	"sync"
	"log"

	"github.com/gofiber/fiber/v2"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"

	"kalvixnexus/backend/platform/db"
	"kalvixnexus/backend/platform/models"
)

var (
	tenantDBCache = make(map[string]*gorm.DB)
	cacheMutex    sync.RWMutex
)

// TenantResolver middleware extracts the subdomain and injects the correct DB connection
func TenantResolver() fiber.Handler {
	return func(c *fiber.Ctx) error {
		subdomain := c.Get("X-Tenant-Subdomain")
		
		if subdomain == "" {
			host := c.Hostname() // e.g., storename.mydomain.com
			parts := strings.Split(host, ".")
			
			// If it's the main domain (e.g., mydomain.com or admin.mydomain.com), we might want to skip or handle differently
			// For now, let's assume if it has 3 or more parts, the first part is the subdomain.
			if len(parts) < 3 {
				// This might be the main platform domain, skip tenant resolution for now
				return c.Next()
			}
			subdomain = parts[0]
		}

		// 1. Always fetch tenant from main database to ensure it's not suspended
		var tenant models.Tenant
		if err := db.MainDB.Where("subdomain = ?", subdomain).First(&tenant).Error; err != nil {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
				"error": "Store not found",
			})
		}

		if tenant.Status != "active" {
			return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
				"error": "Store is suspended",
			})
		}

		// 2. Check if we already have the DB connection cached
		cacheMutex.RLock()
		tenantDB, exists := tenantDBCache[subdomain]
		cacheMutex.RUnlock()

		if exists {
			// Inject into context
			c.Locals("tenantDB", tenantDB)
			return c.Next()
		}

		// 3. Connect to the tenant's database
		hostEnv := os.Getenv("DB_HOST")
		userEnv := os.Getenv("DB_USER")
		passwordEnv := os.Getenv("DB_PASSWORD")
		portEnv := os.Getenv("DB_PORT")

		dsn := fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=%s sslmode=disable TimeZone=UTC", hostEnv, userEnv, passwordEnv, tenant.DBName, portEnv)
		newTenantDB, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
		if err != nil {
			log.Printf("Failed to connect to tenant DB %s: %v", tenant.DBName, err)
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": "Internal Server Error",
			})
		}

		// Cache the connection
		cacheMutex.Lock()
		tenantDBCache[subdomain] = newTenantDB
		cacheMutex.Unlock()

		// Inject into context
		c.Locals("tenantDB", newTenantDB)
		return c.Next()
	}
}

// GetTenantDB is a helper to retrieve the DB connection from Fiber context
func GetTenantDB(c *fiber.Ctx) *gorm.DB {
	db, ok := c.Locals("tenantDB").(*gorm.DB)
	if !ok {
		return nil
	}
	return db
}
