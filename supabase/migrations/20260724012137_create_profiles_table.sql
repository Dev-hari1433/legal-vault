/*
# Create profiles table with auto-creation trigger

1. New Tables
- `profiles`
  - `id` (uuid, primary key — references auth.users)
  - `email` (text, the user's email from auth)
  - `full_name` (text, nullable — set during signup)
  - `avatar_url` (text, nullable — for profile photo)
  - `created_at` (timestamp, defaults to now)
  - `updated_at` (timestamp, auto-updated)

2. Security
- Enable RLS on `profiles`.
- Users can read and update only their own profile row.
- INSERT is handled server-side via trigger (runs as SECURITY DEFINER),
  so no INSERT policy is needed for the client.

3. Automation
- A trigger function `handle_new_user()` runs AFTER INSERT on auth.users
  and inserts a matching row into `profiles` with the user's id, email,
  and full_name (pulled from new_user_meta_data if present).
- A trigger `on_auth_user_created` attaches the function to auth.users.
- An `updated_at` trigger keeps the `updated_at` column current.
*/

CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
CREATE POLICY "profiles_select_own"
ON public.profiles FOR SELECT
TO authenticated
USING (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own"
ON public.profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- No INSERT/DELETE policies: profiles are created by the trigger,
-- and users should not be able to delete their profile row directly.

-- Function to auto-create a profile when a new auth user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', NULL)
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Trigger: fires after a new row is inserted into auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();

-- Function to keep updated_at current
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_set_updated_at ON public.profiles;
CREATE TRIGGER profiles_set_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();
