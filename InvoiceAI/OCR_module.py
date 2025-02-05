import cv2
import pytesseract
import re
import spacy
import fitz  # PyMuPDF for PDFs
import numpy as np
import os
from PIL import Image
from pytesseract import Output

# Set the Tesseract path (Windows example)
pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'

# Load NLP model for address parsing
nlp = spacy.load("en_core_web_sm")

# Invoice data patterns for multiple formats
INVOICE_PATTERNS = {
    "invoice_number": [r'Invoice\s*(No\.?|Number)?:?\s*(\w+)', r'Bill\s*ID:\s*(\w+)'],
    "date": [r'Date:\s*(\d{2,4}[-/.]\d{2}[-/.]\d{2,4})', r'Issue\s*Date:\s*(\d{2,4}[-/.]\d{2,4})'],
    "total_amount": [r'Total\s*(Amount)?:?\s*\$?(\d+[\.,]?\d*)', r'Grand\s*Total:\s*\$?(\d+[\.,]?\d*)']
}

def determine_file_type(file_path):
    """Determine if the uploaded file is an image or PDF."""
    ext = os.path.splitext(file_path)[1].lower()
    if ext in ['.png', '.jpg', '.jpeg', '.tiff', '.bmp', '.gif']:
        return "image"
    elif ext == '.pdf':
        return "pdf"
    else:
        return "unknown"

def preprocess_image(image_path):
    """ Preprocess the image to improve OCR accuracy using OpenCV """
    image = cv2.imread(image_path, cv2.IMREAD_GRAYSCALE)
    
    # Apply adaptive thresholding for better text visibility
    image = cv2.adaptiveThreshold(image, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 11, 2)
    
    # Slightly blur image to reduce noise
    image = cv2.GaussianBlur(image, (3, 3), 0)
    
    return image

def extract_text_from_image(image_path):
    """ Extract text from invoice image using Tesseract OCR """
    image = preprocess_image(image_path)

    # Use layout-aware OCR (PSM 6 is good for uniform text blocks)
    custom_config = r'--oem 3 --psm 6'
    text = pytesseract.image_to_string(image, config=custom_config)

    return text

def extract_text_from_pdf(pdf_path):
    """ Extract text from all pages of a PDF """
    doc = fitz.open(pdf_path)
    text = ""
    
    for page in doc:
        text += page.get_text("text")  # Extract text from tables
    
    return text

def extract_data(text, patterns):
    """ Extract data using multiple regex patterns for better accuracy """
    for pattern in patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            return match.group(2) if len(match.groups()) > 1 else match.group(1)
    return None

def parse_address(text):
    """ Extract address using NLP-based Named Entity Recognition """
    doc = nlp(text)
    address_parts = [ent.text for ent in doc.ents if ent.label_ in ["GPE", "FACILITY", "ORG"]]
    return " ".join(address_parts) if address_parts else None

def extract_invoice_data(text):
    """ Extract structured data from invoice text """
    return {
        "invoice_number": extract_data(text, INVOICE_PATTERNS["invoice_number"]),
        "date": extract_data(text, INVOICE_PATTERNS["date"]),
        "total_amount": extract_data(text, INVOICE_PATTERNS["total_amount"]),
        "address": parse_address(text),
    }

def validate_invoice_data(data):
    """ Validate extracted data to ensure correctness """
    if data["invoice_number"] and not re.match(r'^\w+$', data["invoice_number"]):
        data["invoice_number"] = None  # Invalid invoice number
    
    if data["date"] and not re.match(r'^\d{2,4}[-/.]\d{2,4}[-/.]\d{2,4}$', data["date"]):
        data["date"] = None  # Invalid date format
    
    if data["total_amount"] and not re.match(r'^\d+[\.,]?\d*$', data["total_amount"]):
        data["total_amount"] = None  # Invalid total amount
    
    return data

def process_invoice(file_path):
    """ Determine the file type, extract text, and extract structured data """
    file_type = determine_file_type(file_path)
    
    if file_type == "image":
        print(f"Processing image file: {file_path}")
        extracted_text = extract_text_from_image(file_path)
    
    elif file_type == "pdf":
        print(f"Processing PDF file: {file_path}")
        extracted_text = extract_text_from_pdf(file_path)
    
    else:
        print("Unsupported file format.")
        return None
    
    print("=== Raw Text Extracted ===")
    print(extracted_text)
    
    # Extract structured data
    invoice_data = extract_invoice_data(extracted_text)
    invoice_data = validate_invoice_data(invoice_data)
    
    print("\n=== Structured Invoice Data ===")
    print(invoice_data)
    
    return invoice_data

# Example Usage
if __name__ == "__main__":
    file_path = "invoice-sample.pdf"  # Change this to your file path (image or PDF)
    invoice_data = process_invoice(file_path)
