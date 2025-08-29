-- Create admin user in auth.users table (this will need to be done through Supabase dashboard)
-- We'll create a helper function to check if user is admin based on email

-- First, let's update the is_admin_user function to check for the new admin email
CREATE OR REPLACE FUNCTION public.is_admin_user(user_email text)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT user_email = 'admin@devopify.com';
$function$;

-- Also create a function that can be used to check admin status using auth.uid()
CREATE OR REPLACE FUNCTION public.is_current_user_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 
    FROM auth.users 
    WHERE id = auth.uid() 
    AND email = 'admin@devopify.com'
  );
$function$;