import os
import cv2
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from sklearn.model_selection import train_test_split

# Paths - use os.path.join to handle path separators correctly
IMAGE_FOLDER = os.path.normpath("../dataset/Images")  # Remove trailing slash
METADATA_FILE = "../dataset/FETAL_PLANES_DB_data.csv"

# Load metadata with the semicolon delimiter
df = pd.read_csv(METADATA_FILE, delimiter=";")

print("Sample file names from CSV:")
print(df['Image_name'].head())

# Function to load and preprocess an image
def preprocess_image(image_path, size=(224, 224)):
    """Load, resize, and normalize an image"""
    # Check if the path has a file extension
    base, ext = os.path.splitext(image_path)
    if not ext:
        # Try adding .png extension
        image_path = f"{image_path}.png"
    
    print(f"Attempting to read: {image_path}")
    
    # Check if file exists before attempting to read
    if not os.path.exists(image_path):
        print(f"Error: File does not exist: {image_path}")
        raise FileNotFoundError(f"Could not find image: {image_path}")
    
    image = cv2.imread(image_path, cv2.IMREAD_GRAYSCALE)
    
    if image is None:
        print(f"Error: Failed to read image even though file exists: {image_path}")
        raise ValueError(f"Could not read image: {image_path}")
        
    image = cv2.resize(image, size)  # Resize image
    image = image / 255.0  # Normalize pixel values
    return image

# Load image file names and labels
image_files = df['Image_name'].tolist() 
labels = df['Brain_plane'].tolist() 

# Train-validation-test split
X_train, X_temp, y_train, y_temp = train_test_split(image_files, labels, test_size=0.3, random_state=42)
X_val, X_test, y_val, y_test = train_test_split(X_temp, y_temp, test_size=0.33, random_state=42)

print(f"Train: {len(X_train)}, Validation: {len(X_val)}, Test: {len(X_test)}")

# Function to test preprocessing on a sample image
def test_preprocessing():
    sample_image_name = X_train[0]
    # Properly join the path without adding extra backslashes
    sample_image_path = os.path.join(IMAGE_FOLDER, sample_image_name)
    print(f"Base image path: {sample_image_path}")
    
    try:
        processed_image = preprocess_image(sample_image_path)
        plt.imshow(processed_image, cmap="gray")
        plt.title("Preprocessed Image Sample")
        plt.show()
    except Exception as e:
        print(f"Error during preprocessing: {e}")
        
        # Additional debugging - list all files in the directory
        try:
            print("\nListing files in image directory to help find the correct file:")
            all_files = os.listdir(IMAGE_FOLDER)
            matching_files = [f for f in all_files if sample_image_name in f]
            print(f"Files matching '{sample_image_name}':")
            print(matching_files)
        except Exception as list_error:
            print(f"Error listing directory: {list_error}")

# Run test
if __name__ == "__main__":
    test_preprocessing()