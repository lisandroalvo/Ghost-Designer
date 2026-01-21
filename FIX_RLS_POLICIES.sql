-- ==========================================
-- FIX: Row Level Security Policies
-- This fixes the signup issue by allowing users to create their business
-- Copy ALL of this and run in Supabase SQL Editor
-- ==========================================

-- Drop existing policies that are too restrictive
DROP POLICY IF EXISTS "Users can insert their own business" ON businesses;
DROP POLICY IF EXISTS "Users can insert profiles in their business" ON profiles;

-- Create new policies that allow signup to work

-- Allow users to create their own business during signup
CREATE POLICY "Users can insert their own business"
  ON businesses FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

-- Allow any authenticated user to insert their profile
-- (The auth.uid() = id check ensures they can only create their own profile)
CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Also ensure the profile SELECT policy allows viewing own profile
DROP POLICY IF EXISTS "Users can view profiles in their business" ON profiles;

CREATE POLICY "Users can view profiles in their business"
  ON profiles FOR SELECT
  USING (
    id = auth.uid()
    OR business_id IN (
      SELECT id FROM businesses WHERE owner_id = auth.uid()
    )
  );
