package main

import (
"fmt"
"golang.org/x/crypto/bcrypt"
)

func main() {
hash := "$2b$10$07Ta/7dgzXrfaTc/MI6uZulr.PEU6mOfjRIB7RsbI5kXxQk57ZAHW"
password := "Divine@1"
err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
if err != nil {
fmt.Println("Hash DOES NOT match:", err)
} else {
fmt.Println("Hash MATCHES")
}
}
