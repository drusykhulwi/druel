import pandas as pd

METADATA_FILE = "./dataset/FETAL_PLANES_DB_data.csv"

# Load the CSV and print column names
df = pd.read_csv(METADATA_FILE, encoding="latin1", delimiter=';')  # Change encoding if needed
print(df.columns)  # Display column names
