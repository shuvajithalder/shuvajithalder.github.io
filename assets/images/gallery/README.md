# Photography Gallery Assets Folder

Store your high-resolution custom photography files here!

## 📸 How to Display Your Own Photos
1. Drop your photography files (e.g. `photo1.jpg`, `photo2.jpg`, `photo3.jpg`) in this directory.
2. Open `data/photos.json` and update the `"url"` and `"thumbnail"` paths for each record to match your local file, for example:
   ```json
   {
     "id": 1,
     "title": "My Landscape Sunset",
     "category": "Nature",
     "url": "assets/images/gallery/photo1.jpg",
     "thumbnail": "assets/images/gallery/photo1.jpg",
     "description": "Captured during sunset at the hilltops.",
     "location": "Darjeeling, India",
     "date": "2025-12"
   }
   ```
3. Refresh the page! The website will load your local photos and details instantly.
