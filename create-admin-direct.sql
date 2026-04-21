-- Create admin user directly using SQL
-- This will create the admin user and assign the admin role

-- First, let's create the admin user using the auth admin API
-- Since we can't directly call auth.admin.createUser from SQL,
-- we'll need to use the service role key through a function

-- Create a temporary function to create the admin user
CREATE OR REPLACE FUNCTION create_admin_user()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  admin_user_id UUID;
BEGIN
  -- Insert into auth.users using the service role
  -- Note: This requires service role privileges
  
  -- For now, we'll return instructions for manual creation
  RETURN 'Please create admin user manually through dashboard and then run the role assignment SQL below';
END;
$$;

-- Run the function
SELECT create_admin_user();

-- Drop the temporary function
DROP FUNCTION IF EXISTS create_admin_user();

-- After creating the user manually in dashboard, run this:
-- INSERT INTO public.user_roles (user_id, role) 
-- VALUES ('USER_ID_FROM_DASHBOARD', 'admin');
