-- Create admin user manually
-- First, run this to create the user in auth.users
-- Then run the second part to assign admin role

-- Step 1: Create admin user (run this in SQL Editor)
-- You'll need to do this through the Supabase Dashboard Authentication section
-- or use the admin API directly

-- Step 2: Assign admin role (run this after creating the user)
-- Replace 'USER_ID_HERE' with the actual user ID from the created admin user

INSERT INTO public.user_roles (user_id, role) 
VALUES ('USER_ID_HERE', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;
