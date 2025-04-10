# import pandas as pd

# METADATA_FILE = "./AI/dataset/FETAL_PLANES_DB_data.csv"

# # Load the CSV and print column names
# df = pd.read_csv(METADATA_FILE, encoding="latin1", delimiter=';')  # Change encoding if needed
# print(df.head())            # Check the first 5 rows
# print(df.columns)           # Check all column names
# print(df['Image_name'].head())  # Make sure this column has valid filenames

# print(df['Brain_plane'].unique())
import pandas as pd

excel_file = "./dataset/FETAL_PLANES_DB_data.xlsx"

# List all sheet names
xls = pd.ExcelFile(excel_file)
print(xls.sheet_names)

# Load the sheet and print first rows
df = pd.read_excel(xls, sheet_name=0)
print(df.head())
print(df.columns)

print(df['Image_name'].unique()[:10])  # First 10 filenames
