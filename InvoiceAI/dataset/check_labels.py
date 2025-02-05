import os

label_dir = "C:/Users/lewis/OneDrive/Desktop/client/InvoiceAI/dataset/valid/labels"

if not os.path.exists(label_dir):
    print("❌ Label directory not found!")
else:
    for label_file in os.listdir(label_dir):
        file_path = os.path.join(label_dir, label_file)
        if os.path.getsize(file_path) == 0:
            print(f"⚠️ Warning: {label_file} is empty!")
    print("✅ Label check complete!")
