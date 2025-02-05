from PIL import Image
import os

# Update this path to your dataset images folder
dataset_path = "C:/Users/lewis/OneDrive/Desktop/client/InvoiceAI/dataset/train/images"

print("Checking images for corruption...")

for img_file in os.listdir(dataset_path):
    img_path = os.path.join(dataset_path, img_file)
    try:
        with Image.open(img_path) as img:
            img.verify()  # Verify image integrity
        print(f"✅ {img_file} is valid.")
    except Exception as e:
        print(f"❌ Corrupt image detected: {img_file} - {e}")

print("Image check complete.")
