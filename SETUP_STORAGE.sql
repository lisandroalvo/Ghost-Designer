-- ==========================================
-- Setup Supabase Storage for Image Uploads
-- Run this in Supabase SQL Editor
-- ==========================================

-- Create storage bucket for branding assets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'branding-assets',
  'branding-assets',
  true,
  5242880,
  ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to upload to their business folder
CREATE POLICY "Users can upload branding images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'branding-assets' AND
    (storage.foldername(name))[1] IN (
      SELECT id::text FROM businesses WHERE owner_id = auth.uid()
    )
  );

-- Allow authenticated users to view images in their business folder
CREATE POLICY "Users can view their branding images"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'branding-assets' AND
    (
      (storage.foldername(name))[1] IN (
        SELECT id::text FROM businesses WHERE owner_id = auth.uid()
      )
      OR bucket_id = 'branding-assets'
    )
  );

-- Allow public read access to all images (since they're used in the app)
CREATE POLICY "Public can view branding images"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'branding-assets');

-- Allow users to delete their own branding images
CREATE POLICY "Users can delete their branding images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'branding-assets' AND
    (storage.foldername(name))[1] IN (
      SELECT id::text FROM businesses WHERE owner_id = auth.uid()
    )
  );
