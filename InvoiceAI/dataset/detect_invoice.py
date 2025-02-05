
#Load the trained YOLO model
model = YOLO("runs/detect/train/weights/best.pt")  # Adjust path as per your output

#Load an invoice image
image_path = "invoice-sample.png"
image = cv2.imread(image_path)

#Run object detection
results = model.predict(image)

#Display the detection results
results.show()