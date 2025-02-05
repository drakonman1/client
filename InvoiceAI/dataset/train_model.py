import os
import cv2
import torch
from ultralytics import YOLO

# =============== SETTINGS ===============
EPOCHS = 3  # Total training epochs
TEST_EVERY = 1  # Run mock test every X epochs
TEST_IMAGES_FOLDER = "./mock_test"  # Folder with sample test images
OUTPUT_FOLDER = "./training_progress"  # Where test results are saved

# Create output folder
os.makedirs(OUTPUT_FOLDER, exist_ok=True)

# Load the YOLO model (pretrained)
model = YOLO("yolov8n.pt")  

# =============== TRAINING LOOP ===============
for epoch in range(1, EPOCHS + 1):
    print(f"🚀 Training Epoch {epoch}/{EPOCHS}")

    # Train YOLO for 1 epoch at a time
    model.train(data="invoice_data.yaml", epochs=1, imgsz=640, resume=True)  

    # Every TEST_EVERY epochs, run mock test on sample invoices
    if epoch % TEST_EVERY == 0:
        print(f"🔍 Running mock test at Epoch {epoch}...")

        for img_file in os.listdir(TEST_IMAGES_FOLDER):
            img_path = os.path.join(TEST_IMAGES_FOLDER, img_file)

            # Run YOLO inference on test image
            results = model(img_path)  

            # Save results (bounding boxes) in training_progress folder
            for i, result in enumerate(results):
                result.save(filename=f"{OUTPUT_FOLDER}/epoch_{epoch}_{img_file}")
            
            print(f"✅ Saved mock test result: {OUTPUT_FOLDER}/epoch_{epoch}_{img_file}")

print("🎉 Training completed!")

# =============== BONUS: Compare Learning Progress ===============
def compare_learning_progress(image1, image2, output_file):
    """ Merge two images side by side to compare YOLO's learning progress """
    img1 = cv2.imread(image1)
    img2 = cv2.imread(image2)

    # Resize images to match height
    height = min(img1.shape[0], img2.shape[0])
    img1 = cv2.resize(img1, (int(img1.shape[1] * height / img1.shape[0]), height))
    img2 = cv2.resize(img2, (int(img2.shape[1] * height / img2.shape[0]), height))

    # Combine images
    merged = cv2.hconcat([img1, img2])

    # Save the comparison image
    cv2.imwrite(output_file, merged)

    print(f"🖼️ Comparison saved: {output_file}")

# Compare how YOLO improved over training (First vs Last Epoch)
for img_file in os.listdir(TEST_IMAGES_FOLDER):
    img_early = f"{OUTPUT_FOLDER}/epoch_{TEST_EVERY}_{img_file}"
    img_late = f"{OUTPUT_FOLDER}/epoch_{EPOCHS}_{img_file}"
    comparison_output = f"{OUTPUT_FOLDER}/comparison_{img_file}"

    if os.path.exists(img_early) and os.path.exists(img_late):
        compare_learning_progress(img_early, img_late, comparison_output)
    else:
        print(f"⚠️ Skipping {img_file} (missing early or late epoch result)")
