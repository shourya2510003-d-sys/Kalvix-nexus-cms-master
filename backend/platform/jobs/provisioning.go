package jobs

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"os"

	"github.com/hibiken/asynq"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"

	"kalvixnexus/backend/platform/db"
	"kalvixnexus/backend/platform/models"
	tenantmodels "kalvixnexus/backend/tenant/models"
)

const (
	TypeTenantProvision = "tenant:provision"
)

type TenantProvisionPayload struct {
	TenantID uint
}

// EnqueueTenantProvisioning adds a job to create a database for a new tenant
func EnqueueTenantProvisioning(tenantID uint) error {
	payload, err := json.Marshal(TenantProvisionPayload{TenantID: tenantID})
	if err != nil {
		return err
	}

	task := asynq.NewTask(TypeTenantProvision, payload, asynq.MaxRetry(3))
	info, err := Client.Enqueue(task, asynq.Queue("critical"))
	if err != nil {
		return err
	}

	log.Printf("Enqueued job: id=%s queue=%s", info.ID, info.Queue)
	return nil
}

// HandleTenantProvisionTask processes the provisioning task
func HandleTenantProvisionTask(ctx context.Context, t *asynq.Task) error {
	var p TenantProvisionPayload
	if err := json.Unmarshal(t.Payload(), &p); err != nil {
		return fmt.Errorf("failed to parse task payload: %v", err)
	}

	// 1. Fetch Tenant from Master DB
	var tenant models.Tenant
	if err := db.MainDB.First(&tenant, p.TenantID).Error; err != nil {
		return fmt.Errorf("tenant not found: %v", err)
	}

	// 2. Create the Database for the tenant
	createDBQuery := fmt.Sprintf("CREATE DATABASE \"%s\"", tenant.DBName)
	if err := db.MainDB.Exec(createDBQuery).Error; err != nil {
		// PostgreSQL throws an error if DB exists, which is fine to ignore or handle
		log.Printf("Warning: Failed to create database %s (it might already exist): %v", tenant.DBName, err)
	} else {
		log.Printf("Created database %s for tenant %d", tenant.DBName, p.TenantID)
	}

	// Note: Connect to this new DB and run AutoMigrate 
	hostEnv := os.Getenv("DB_HOST")
	userEnv := os.Getenv("DB_USER")
	passwordEnv := os.Getenv("DB_PASSWORD")
	portEnv := os.Getenv("DB_PORT")

	sslmode := os.Getenv("DB_SSLMODE")
	if sslmode == "" {
		sslmode = "disable"
	}
	dsn := fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=%s sslmode=%s TimeZone=UTC", hostEnv, userEnv, passwordEnv, tenant.DBName, portEnv, sslmode)
	newTenantDB, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err == nil {
		newTenantDB.AutoMigrate(&tenantmodels.Product{}, &tenantmodels.Customer{}, &tenantmodels.Order{}, &tenantmodels.OrderItem{})
		log.Printf("Auto-migrated schema for tenant %d", p.TenantID)
	}

	// 3. Generate Traefik dynamic route configuration
	traefikConfig := fmt.Sprintf(`http:
  routers:
    frontend-%s:
      rule: "Host(`+"`%s.kalvixnexus.com`"+`)"
      service: frontend
      entryPoints:
        - websecure
      tls:
        certResolver: myresolver
    backend-%s:
      rule: "Host(`+"`api.%s.kalvixnexus.com`"+`)"
      service: backend
      entryPoints:
        - websecure
      tls:
        certResolver: myresolver
`, tenant.Subdomain, tenant.Subdomain, tenant.Subdomain, tenant.Subdomain)

	configPath := fmt.Sprintf("/etc/traefik/dynamic/%s.yml", tenant.Subdomain)
	if err := os.WriteFile(configPath, []byte(traefikConfig), 0644); err != nil {
		log.Printf("Warning: Failed to write Traefik config for %s: %v", tenant.Subdomain, err)
	} else {
		log.Printf("Created Traefik dynamic route config at %s", configPath)
	}

	// 4. Mark tenant as provisioned/active (if not already)
	tenant.Status = "active"
	db.MainDB.Save(&tenant)

	log.Printf("Successfully provisioned tenant: %d", p.TenantID)
	return nil
}

// RegisterHandlers registers all job handlers
func RegisterHandlers() {
	Mux.HandleFunc(TypeTenantProvision, HandleTenantProvisionTask)
}
