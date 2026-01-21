# Database Schema Fix for Student Management

## Problem
The error "Could not find the 'membership_status' column of 'profiles' in the schema cache" occurs because your Supabase database is missing the required columns for student management.

## Solution

### Option 1: Quick Fix (Recommended)
Run the migration script to add the missing columns to your existing database:

1. Open your Supabase project dashboard
2. Go to **SQL Editor**
3. Copy the contents of `FIX_STUDENT_SCHEMA.sql`
4. Paste and run it in the SQL Editor

This will add:
- `phone` column
- `membership_status` column (Active, Paused, Cancelled)
- `membership_type` column
- `notes` column
- Required indexes and policies

### Option 2: Fresh Start
If you want to start fresh with the correct schema:

1. Drop your existing tables (WARNING: This deletes all data!)
2. Copy the contents of `COPY_THIS_TO_SUPABASE.sql`
3. Run it in Supabase SQL Editor

## After Running the Fix

1. Refresh your application page
2. Try adding a student again
3. The error should be resolved

## What Changed

The `profiles` table now supports student-specific fields:
- **phone**: Student's phone number (optional)
- **membership_status**: Active, Paused, or Cancelled
- **membership_type**: Monthly, Quarterly, Annual, Drop-in, or Trial
- **notes**: Additional notes about the student (medical conditions, etc.)

The RLS policies were also updated to allow:
- Owners to update all profiles in their business
- Owners to delete profiles in their business
