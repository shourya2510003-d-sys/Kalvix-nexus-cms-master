package main

import (
	"log"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/gofiber/fiber/v2/middleware/cors"

	"kalvixnexus/backend/platform/db"
	"kalvixnexus/backend/platform/jobs"
	"kalvixnexus/backend/platform/models"
	"kalvixnexus/backend/platform/services"
	platformControllers "kalvixnexus/backend/platform/controllers"
	platformMiddlewares "kalvixnexus/backend/platform/middlewares"
	tenantControllers "kalvixnexus/backend/tenant/controllers"
	"kalvixnexus/backend/tenant/middlewares"
)

func main() {
	// Initialize main database
	db.InitMainDB()
	db.InitRedis()
	jobs.InitAsynq()
	go jobs.StartAsynqServer()

	// Migrate main platform models
	if err := db.MainDB.AutoMigrate(
		&models.Tenant{}, &models.User{}, &models.Subscription{},
		&models.Employee{}, &models.Attendance{}, &models.Client{}, 
		&models.Project{}, &models.ProjectAssignment{},
	); err != nil {
		log.Fatalf("Failed to migrate main DB: %v", err)
	}

	app := fiber.New()
	app.Use(logger.New())
	app.Use(cors.New(cors.Config{
		AllowOrigins: "*",
		AllowHeaders: "Origin, Content-Type, Accept, Authorization, X-Tenant-Subdomain",
	}))

	// Platform Routes (No tenant resolver)
	app.Post("/platform/tenant", func(c *fiber.Ctx) error {
		type CreateRequest struct {
			Name      string `json:"name"`
			Subdomain string `json:"subdomain"`
		}
		var req CreateRequest
		if err := c.BodyParser(&req); err != nil {
			return c.Status(400).JSON(fiber.Map{"error": "Invalid request body"})
		}

		tenant, err := services.CreateTenant(req.Name, req.Subdomain)
		if err != nil {
			return c.Status(500).JSON(fiber.Map{"error": err.Error()})
		}

		return c.JSON(tenant)
	})

	// Platform Auth Endpoints
	app.Post("/platform/auth/login", platformControllers.MasterLogin)
	app.Post("/platform/signup", platformControllers.SignupTenant)



	// Kalvix Internal Endpoints (CRM & Ops) - Protected by SuperAdmin role
	kalvixApi := app.Group("/platform", platformMiddlewares.RequireAuth, platformMiddlewares.RequireRole("superadmin"))
	kalvixApi.Get("/employees", platformControllers.GetEmployees)
	kalvixApi.Post("/employees", platformControllers.CreateEmployee)
	kalvixApi.Get("/clients", platformControllers.GetClients)
	kalvixApi.Post("/clients", platformControllers.CreateClient)
	
	// Admin Dashboard APIs
	kalvixApi.Get("/tenants", platformControllers.GetTenants)
	kalvixApi.Put("/tenants/:id/status", platformControllers.UpdateTenantStatus)

	// Tenant Routes (Requires tenant resolver)
	api := app.Group("/api", middlewares.TenantResolver())
	
	api.Get("/info", func(c *fiber.Ctx) error {
		tenantDB := middlewares.GetTenantDB(c)
		if tenantDB == nil {
			return c.Status(500).JSON(fiber.Map{"error": "Tenant DB not available in context"})
		}
		
		// Typically you would run query on tenantDB here
		// e.g. tenantDB.Find(&products)
		
		return c.JSON(fiber.Map{
			"message": "Hello from tenant specific database!",
			"db_name": tenantDB.Migrator().CurrentDatabase(),
		})
	})
	
	// Tenant Auth Endpoints
	api.Post("/auth/login", tenantControllers.CustomerLogin)
	
	// CMS Endpoints
	api.Get("/cms/layout/*", tenantControllers.GetCMSLayout)
	api.Get("/kv/:key", tenantControllers.GetKV)
	api.Post("/kv/:key", tenantControllers.SetKV)
	
	api.Get("/products", tenantControllers.GetProducts)
	api.Get("/products/:slug", tenantControllers.GetProductBySlug)
	api.Post("/products", platformMiddlewares.RequireAuth, platformMiddlewares.RequireRole("tenantadmin"), tenantControllers.CreateProduct)
	
	api.Get("/categories", tenantControllers.GetCategories)
	
	// Orders
	api.Get("/orders", tenantControllers.GetOrders)
	api.Post("/orders", tenantControllers.CreateOrder)

	log.Println("Starting server on :3000")
	if err := app.Listen(":3000"); err != nil {
		log.Fatalf("Error starting server: %v", err)
	}
}
