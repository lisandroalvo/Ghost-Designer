import { supabase } from '../lib/supabase';

class StorageService {
  private readonly BUCKET_NAME = 'branding-assets';

  /**
   * Initialize storage bucket (call this once during setup)
   */
  async initializeBucket() {
    // Check if bucket exists
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some(b => b.name === this.BUCKET_NAME);

    if (!bucketExists) {
      // Create bucket if it doesn't exist
      const { error } = await supabase.storage.createBucket(this.BUCKET_NAME, {
        public: true,
        fileSizeLimit: 5242880, // 5MB
        allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp']
      });

      if (error) {
        console.error('Error creating bucket:', error);
        throw error;
      }
    }
  }

  /**
   * Upload image file and return public URL
   */
  async uploadImage(
    file: File,
    businessId: string,
    type: 'logo' | 'hero'
  ): Promise<string> {
    try {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        throw new Error('File must be an image');
      }

      // Validate file size (5MB max)
      if (file.size > 5242880) {
        throw new Error('File size must be less than 5MB');
      }

      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${businessId}/${type}-${Date.now()}.${fileExt}`;

      // Upload file
      const { data, error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (error) throw error;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(this.BUCKET_NAME)
        .getPublicUrl(data.path);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  }

  /**
   * Delete image from storage
   */
  async deleteImage(url: string): Promise<void> {
    try {
      // Extract path from URL
      const path = url.split(`${this.BUCKET_NAME}/`)[1];
      if (!path) return;

      const { error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .remove([path]);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting image:', error);
      throw error;
    }
  }

  /**
   * Upload logo
   */
  async uploadLogo(file: File, businessId: string): Promise<string> {
    return this.uploadImage(file, businessId, 'logo');
  }

  /**
   * Upload hero image
   */
  async uploadHeroImage(file: File, businessId: string): Promise<string> {
    return this.uploadImage(file, businessId, 'hero');
  }
}

export const storageService = new StorageService();
