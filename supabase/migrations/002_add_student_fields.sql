-- Add missing columns to profiles table for student management

-- Add phone column
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS phone TEXT;

-- Add membership_status column
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS membership_status TEXT CHECK (membership_status IN ('Active', 'Paused', 'Cancelled'));

-- Add membership_type column
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS membership_type TEXT;

-- Add notes column
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS notes TEXT;

-- Create index for membership_status for faster queries
CREATE INDEX IF NOT EXISTS idx_profiles_membership_status ON profiles(membership_status);
