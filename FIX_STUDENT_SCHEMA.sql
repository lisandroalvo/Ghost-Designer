-- ==========================================
-- FIX: Add Missing Student Fields to Profiles Table
-- Copy this and run it in Supabase SQL Editor
-- ==========================================

-- Add missing columns to profiles table for student management
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS phone TEXT;

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS membership_status TEXT CHECK (membership_status IN ('Active', 'Paused', 'Cancelled'));

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS membership_type TEXT;

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS notes TEXT;

-- Create index for membership_status for faster queries
CREATE INDEX IF NOT EXISTS idx_profiles_membership_status ON profiles(membership_status);

-- Update the profiles UPDATE policy to allow owners to update all profiles in their business
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;

CREATE POLICY "Users can update profiles in their business"
  ON profiles FOR UPDATE
  USING (
    id = auth.uid()
    OR business_id IN (
      SELECT id FROM businesses WHERE owner_id = auth.uid()
    )
  );

-- Add DELETE policy for profiles
CREATE POLICY "Owners can delete profiles in their business"
  ON profiles FOR DELETE
  USING (
    business_id IN (
      SELECT id FROM businesses WHERE owner_id = auth.uid()
    )
  );
