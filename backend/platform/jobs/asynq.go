package jobs

import (
	"log"
	"os"

	"github.com/hibiken/asynq"
)

var Client *asynq.Client
var Server *asynq.Server
var Mux *asynq.ServeMux

func InitAsynq() {
	redisUrl := os.Getenv("REDIS_URL")
	var redisConnOpt asynq.RedisConnOpt

	if redisUrl != "" {
		opt, err := asynq.ParseRedisURI(redisUrl)
		if err != nil {
			log.Fatalf("Failed to parse REDIS_URL for asynq: %v", err)
		}
		redisConnOpt = opt
	} else {
		host := os.Getenv("REDIS_HOST")
		if host == "" {
			host = "redis"
		}
		port := os.Getenv("REDIS_PORT")
		if port == "" {
			port = "6379"
		}
		password := os.Getenv("REDIS_PASSWORD")
	
		redisConnOpt = asynq.RedisClientOpt{
			Addr:     host + ":" + port,
			Password: password,
		}
	}

	// Initialize Client for enqueueing jobs
	Client = asynq.NewClient(redisConnOpt)

	// Initialize Server for processing jobs
	Server = asynq.NewServer(
		redisConnOpt,
		asynq.Config{
			Concurrency: 1,
			Queues: map[string]int{
				"critical": 6,
				"default":  3,
				"low":      1,
			},
		},
	)

	// Initialize Mux for routing jobs
	Mux = asynq.NewServeMux()

	log.Println("Asynq initialized successfully")
}

func StartAsynqServer() {
	RegisterHandlers()
	if err := Server.Start(Mux); err != nil {
		log.Fatalf("could not start asynq server: %v", err)
	}
}
