from google.cloud import storage
import json
import os

def download_cookies_from_gcs(bucket_name: str, blob_name: str, destination_file: str = "cookies.json"):
    """
    Downloads cookies.json from GCS to local file system.
    """
    client = storage.Client()
    bucket = client.bucket(bucket_name)
    blob = bucket.blob(blob_name)
    blob.download_to_filename(destination_file)
    print(f"✅ Downloaded {blob_name} from GCS to {destination_file}")

def load_cookies(bucket_name="linkedin-scraper-data", blob_name="cookies.json"):
    """
    Wrapper to download and load cookies.json from GCS
    """
    download_cookies_from_gcs(bucket_name, blob_name)
    with open("cookies.json", "r") as f:
        cookies = json.load(f)
    print("✅ Cookies loaded successfully.")
    return cookies 