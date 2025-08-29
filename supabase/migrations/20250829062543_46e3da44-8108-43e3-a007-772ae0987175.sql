-- Create admin user (this will be used for admin authentication)
-- The admin user will be created via email/password: admin@devopify / admin
-- Note: This is a placeholder - the actual user creation will need to be done through Supabase auth

-- For now, we'll create a simple admin check function
-- The actual admin user should be created manually through Supabase dashboard or by signing up with admin@devopify

-- Create a simple admin verification function (placeholder)
CREATE OR REPLACE FUNCTION public.is_admin_user(user_email TEXT)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT user_email = 'admin@devopify';
$$;