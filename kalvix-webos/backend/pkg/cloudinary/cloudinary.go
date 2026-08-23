package cloudinary

import (
	"context"
	"fmt"
	"os"

	"github.com/cloudinary/cloudinary-go/v2"
	"github.com/cloudinary/cloudinary-go/v2/api/uploader"
)

var cld *cloudinary.Cloudinary

func InitCloudinary() error {
	url := os.Getenv("CLOUDINARY_URL")
	if url == "" {
		return fmt.Errorf("CLOUDINARY_URL is not set")
	}

	var err error
	cld, err = cloudinary.NewFromURL(url)
	if err != nil {
		return err
	}
	return nil
}

// UploadImage uploads an image to Cloudinary and returns the secure URL
func UploadImage(ctx context.Context, file interface{}, folder string) (string, error) {
	if cld == nil {
		return "", fmt.Errorf("cloudinary not initialized")
	}

	resp, err := cld.Upload.Upload(ctx, file, uploader.UploadParams{
		Folder: folder,
	})
	if err != nil {
		return "", err
	}

	return resp.SecureURL, nil
}
