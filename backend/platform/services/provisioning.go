package services

import (
	"fmt"
	"os"

	"kalvixnexus/backend/platform/db"
	"kalvixnexus/backend/platform/models"
)

func CreateTenant(name, subdomain string) (*models.Tenant, error) {
	dbName := fmt.Sprintf("tenant_%s", subdomain)

	// 1. Create Database in Postgres
	// Gorm doesn't natively support CREATE DATABASE in a standard query well, so we execute raw SQL.
	createDBQuery := fmt.Sprintf("CREATE DATABASE %s;", dbName)
	if err := db.MainDB.Exec(createDBQuery).Error; err != nil {
		return nil, fmt.Errorf("failed to create database: %v", err)
	}

	// 2. Insert into Main DB
	tenant := &models.Tenant{
		Name:      name,
		Subdomain: subdomain,
		DBName:    dbName,
		Status:    "active",
	}

	if err := db.MainDB.Create(tenant).Error; err != nil {
		// Rollback DB creation (best effort)
		db.MainDB.Exec(fmt.Sprintf("DROP DATABASE IF EXISTS %s;", dbName))
		return nil, fmt.Errorf("failed to save tenant record: %v", err)
	}

	// 3. Write Traefik Dynamic Config for this tenant (so it gets SSL via HTTP Challenge)
	if err := writeTraefikConfig(subdomain); err != nil {
		return tenant, fmt.Errorf("tenant created but traefik config failed: %v", err)
	}

	return tenant, nil
}

func writeTraefikConfig(subdomain string) error {
	configContent := fmt.Sprintf(`http:
  routers:
    %s-router:
      rule: "Host('%s.mydomain.com')"
      entryPoints:
        - websecure
      tls:
        certResolver: myresolver
      service: backend-service

  services:
    backend-service:
      loadBalancer:
        servers:
          - url: "http://backend:3000"
`, subdomain, subdomain)

	filePath := fmt.Sprintf("/etc/traefik/dynamic/%s.yml", subdomain)
	return os.WriteFile(filePath, []byte(configContent), 0644)
}
