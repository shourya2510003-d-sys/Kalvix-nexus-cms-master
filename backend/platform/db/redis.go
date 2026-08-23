package db

import (
	"context"
	"log"
	"os"
	"time"

	"github.com/redis/go-redis/v9"
)

var RedisClient *redis.Client
var Ctx = context.Background()

func InitRedis() {
	host := os.Getenv("REDIS_HOST")
	if host == "" {
		host = "redis" // Default in docker-compose
	}
	port := os.Getenv("REDIS_PORT")
	if port == "" {
		port = "6379"
	}

	RedisClient = redis.NewClient(&redis.Options{
		Addr:     host + ":" + port,
		Password: "", // No password by default
		DB:       0,  // Use default DB
	})

	// Test connection
	_, err := RedisClient.Ping(Ctx).Result()
	if err != nil {
		log.Fatalf("Failed to connect to Redis: %v", err)
	}

	log.Println("Connected to Redis successfully")
}

func SetCache(key string, value string, expiration time.Duration) error {
	return RedisClient.Set(Ctx, key, value, expiration).Err()
}

func GetCache(key string) (string, error) {
	return RedisClient.Get(Ctx, key).Result()
}
