from bing_image_downloader import downloader

# List of people to download
people = ["Pawan Kalyan"]

# Loop through each person and download images
for person in people:
    print(f"🔍 Downloading images for {person}")
    downloader.download(
        person,
        limit=30,  # number of images per person
        output_dir="D:/ML/ML Project 2(Classification)",  # your dataset path
        adult_filter_off=True,
        force_replace=False,
        timeout=60
    )
    print(f"✅ Done: {person}")

print("🎉 All downloads completed successfully!")
