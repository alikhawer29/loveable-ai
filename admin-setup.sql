-- Admin User Setup Script
-- Run this in Supabase SQL Editor after creating the user manually

-- Step 1: Create the admin user manually through Supabase Dashboard:
-- 1. Go to Authentication -> Users
-- 2. Click "Add User"
-- 3. Email: admin@testadmin.com
-- 4. Password: Infinity@2026
-- 5. Enable "Auto confirm"
-- 6. Add metadata: {"full_name": "Tom Albert"}
-- 7. Click "Create User"

-- Step 2: After creating the user, get the User ID from the Users table
-- Then run this SQL to assign admin role:

-- Replace 'YOUR_USER_ID_HERE' with the actual user ID from the created user
INSERT INTO public.user_roles (user_id, role) 
VALUES ('YOUR_USER_ID_HERE', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;

-- Verify the admin role was assigned
SELECT 
  u.email,
  u.created_at,
  r.role,
  r.user_id
FROM auth.users u
JOIN public.user_roles r ON u.id = r.user_id
WHERE u.email = 'admin@testadmin.com';
