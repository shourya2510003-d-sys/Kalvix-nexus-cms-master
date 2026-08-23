import sys
from PIL import Image

def remove_background(image_path):
    try:
        img = Image.open(image_path).convert("RGBA")
        datas = img.getdata()

        # Get the background color from the top-left pixel
        bg_color = datas[0]
        
        # We define a tolerance for what counts as background
        tolerance = 30
        
        newData = []
        for item in datas:
            # Check if pixel is close to background color
            if (abs(item[0] - bg_color[0]) < tolerance and 
                abs(item[1] - bg_color[1]) < tolerance and 
                abs(item[2] - bg_color[2]) < tolerance):
                # If so, make it transparent
                newData.append((255, 255, 255, 0))
            else:
                newData.append(item)

        img.putdata(newData)
        img.save(image_path, "PNG")
        print("Background removed successfully!")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    remove_background("public/logo.png")
