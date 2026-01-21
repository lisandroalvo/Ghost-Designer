# Simple Storage Bucket Setup (No Policies Needed!)

## The Easiest Way - Just 4 Clicks!

Since you're getting permission errors with SQL and policies are complex, here's the **super simple** way:

---

## Step 1: Create Public Bucket (4 clicks)

1. **Click this link:** https://supabase.com/dashboard/project/ywqxcxmjufahvaqwjfua/storage/buckets

2. **Click the "New bucket" button** (green button, top right)

3. **Type ONLY these 2 things:**
   - Name: `branding-assets`
   - Toggle "Public bucket" to **ON** ✅

4. **Click "Create bucket"**

That's it! ✅

---

## Step 2: Disable RLS (Makes it work without policies)

Since the bucket is already public and you're having issues with policies, we can disable RLS to make uploads work immediately:

**Option A: Through Dashboard**
1. Click on `branding-assets` bucket
2. Go to **Configuration** tab
3. Look for security settings
4. If there's an option to disable RLS or make it public without policies, use it

**Option B: Quick SQL Fix**
If Option A doesn't work, run this ONE simple SQL command:

```sql
ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;
```

⚠️ **Note:** This makes storage fully open, which is fine for development but you should add proper policies before production.

---

## Step 3: Test It!

```bash
npm run dev
```

Go to Branding tab and try uploading an image!

---

## Why This Works:

- Public bucket = anyone can read (needed for images to display)
- RLS disabled = no policy restrictions
- Perfect for testing and development
- You can add proper policies later when app is ready for production

---

**Just create the bucket as PUBLIC and you're done!** The upload will work without any policies. 🚀
