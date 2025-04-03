import os
import tensorflow as tf
import matplotlib.pyplot as plt

# Disable oneDNN optimizations
os.environ['TF_ENABLE_ONEDNN_OPTS'] = '0'

def augment_image(image):
    """Apply random transformations to an image"""
    data_augmentation = tf.keras.Sequential([
        tf.keras.layers.RandomFlip("horizontal"),
        tf.keras.layers.RandomRotation(0.2),
        tf.keras.layers.RandomZoom(0.2),
        tf.keras.layers.RandomBrightness(0.2),
    ])
    return data_augmentation(image)

def process_and_augment_images(image_folder):
    """Process all images in a folder and apply augmentation"""
    for filename in os.listdir(image_folder):
        if filename.lower().endswith('.png'):  # Only process PNG files
            image_path = os.path.join(image_folder, filename)
            
            # Load the image (for PNG format)
            image = tf.io.read_file(image_path)
            image = tf.image.decode_png(image, channels=3)  # Decode as RGB (3 channels)
            image = tf.image.resize(image, [256, 256])  # Resize to a standard size

            # Augment the image
            augmented_image = augment_image(image)

            # Convert augmented image to uint8 before encoding as PNG
            augmented_image_uint8 = tf.cast(augmented_image * 255.0, tf.uint8)

            # Encode the augmented image as PNG
            augmented_image_encoded = tf.image.encode_png(augmented_image_uint8)

            # Save the augmented image
            augmented_image_path = os.path.join(image_folder, 'aug_' + filename)
            tf.io.write_file(augmented_image_path, augmented_image_encoded)
            
            # Optionally, display the augmented image
            plt.imshow(augmented_image_uint8.numpy())  # Show as uint8 for correct display
            plt.title(f"Augmented: {filename}")
            plt.show()

# Path to your folder containing images
image_folder = '../dataset/Images'  
process_and_augment_images(image_folder)
