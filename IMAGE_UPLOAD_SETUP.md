# Image Upload Feature Setup

## ✨ What's New

Your branding form now supports **image uploads directly from your device**! Users can either:
- 📁 **Upload files** from their computer (PNG, JPG, GIF, WebP up to 5MB)
- 🔗 **Use URLs** for hosted images

---

## 🚀 Setup Instructions

### Step 1: Run the Storage SQL

1. Open [SETUP_STORAGE.sql](SETUP_STORAGE.sql)
2. Copy **ALL** the SQL
3. Go to Supabase SQL Editor: https://supabase.com/dashboard/project/ywqxcxmjufahvaqwjfua/sql/new
4. Paste and click **"Run"**

This will:
- Create a `branding-assets` storage bucket
- Set up RLS policies for secure uploads
- Allow public read access (so images show in your app)
- Restrict uploads to business owners only

---

### Step 2: Verify Storage Bucket

1. Go to Storage: https://supabase.com/dashboard/project/ywqxcxmjufahvaqwjfua/storage/buckets
2. You should see **branding-assets** bucket
3. It should be marked as **Public**

---

### Step 3: Test It Out!

1. Restart your dev server if it's running:
   ```bash
   npm run dev
   ```

2. Go to the **Branding** tab in your app

3. You'll see new upload sections for Logo and Hero Image with two modes:
   - **Upload File** - Click and select from your computer
   - **Use URL** - Paste an image URL

---

## 🎨 How It Works

### For Logo:
1. Click **"Upload File"** button
2. Choose between "Upload File" and "Use URL"
3. If uploading:
   - Click the upload area
   - Select an image file
   - Wait for upload (shows spinner)
   - Image URL is automatically saved
4. If using URL:
   - Paste URL in the input field
   - Click "Set" or press Enter

### For Hero Image:
Same process as Logo!

---

## 📂 File Structure

Uploaded images are stored in Supabase Storage:
```
branding-assets/
  └── {business_id}/
      ├── logo-{timestamp}.png
      └── hero-{timestamp}.jpg
```

Each business has its own folder for organization and security.

---

## 🔒 Security

- ✅ Only authenticated business owners can upload
- ✅ Files limited to 5MB
- ✅ Only image formats accepted
- ✅ Each business can only upload to their own folder
- ✅ Public read access (images need to be visible in app)

---

## 📏 File Limits

- **Max file size**: 5MB
- **Allowed formats**: PNG, JPG, JPEG, GIF, WebP
- **Storage**: Unlimited files (Supabase free tier: 1GB total)

---

## 🎯 Features

### ✨ New Components Created:

1. **ImageUpload.tsx** - Reusable image upload component with:
   - File drag & drop area
   - URL input option
   - Live image preview
   - Upload progress indicator
   - File validation

2. **storage.ts** - Storage service with:
   - `uploadLogo()` - Upload logo images
   - `uploadHeroImage()` - Upload hero images
   - `deleteImage()` - Remove uploaded images
   - File validation and error handling

---

## 🧪 Testing Checklist

- [ ] Run SETUP_STORAGE.sql successfully
- [ ] See branding-assets bucket in Supabase
- [ ] Restart dev server
- [ ] Open Branding tab
- [ ] See "Upload File" / "Use URL" toggle
- [ ] Upload a logo image
- [ ] Verify upload success message
- [ ] See image preview appear
- [ ] Click "Save Branding Changes"
- [ ] Refresh page - image should persist
- [ ] Upload a hero image
- [ ] Try switching between Upload and URL modes

---

## 💡 Tips

- Images are uploaded immediately (don't forget to click "Save Branding Changes" after!)
- You can switch between Upload and URL modes anytime
- Previous images are kept in storage (you can manually delete old ones from Supabase Dashboard)
- Image URLs are stored in the database, files are in Supabase Storage

---

## 🐛 Troubleshooting

### "Upload failed: No business ID"
- Make sure you're logged in
- Try signing out and back in

### "File size must be less than 5MB"
- Compress your image using tools like TinyPNG
- Use JPEG instead of PNG for photos

### "Please select an image file"
- Only image formats are allowed
- PDFs, videos, etc. will be rejected

### Storage bucket not found
- Run SETUP_STORAGE.sql
- Check that branding-assets bucket exists
- Verify bucket is set to Public

---

## 🎉 You're All Set!

Your users can now upload logos and hero images directly from their devices. No need for external hosting!

The images are:
- ✅ Automatically uploaded to Supabase Storage
- ✅ Publicly accessible via CDN
- ✅ Organized by business ID
- ✅ Secured with RLS policies

Enjoy! 🚀
