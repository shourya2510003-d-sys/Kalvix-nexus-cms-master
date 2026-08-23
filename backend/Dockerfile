FROM golang:alpine

WORKDIR /app

# Copy go.mod and go.sum files
COPY go.mod go.sum ./

# Download dependencies
RUN go mod download

# Copy the entire source code
COPY . .

# Build the application
RUN go build -o main .

# Expose port (if Fiber uses a specific port, say 3000)
EXPOSE 3000

# Command to run the application
CMD ["./main"]
