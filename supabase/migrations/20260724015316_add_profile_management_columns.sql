/*
# Extend profiles table with personal information fields

## Summary
Adds 12 new columns to the `profiles` table to support the Profile Management feature.
Users can now store: date of birth, gender, blood group, phone, nationality, address,
occupation, marital status, religion (optional), emergency contact, languages, and
biometric authentication preference.

## New Columns on `profiles`
1. `phone` (text, nullable) — user's phone number
2. `date_of_birth` (date, nullable) — user's date of birth
3. `gender` (text, nullable) — male / female / other / prefer_not_to_say
4. `blood_group` (text, nullable) — A+, A-, B+, B-, AB+, AB-, O+, O-
5. `nationality` (text, nullable) — user's nationality
6. `address` (text, nullable) — full street address
7. `occupation` (text, nullable) — job title / profession
8. `marital_status` (text, nullable) — single / married / divorced / widowed / separated
9. `religion` (text, nullable) — optional religious affiliation
10. `emergency_contact` (text, nullable) — name and phone of emergency contact
11. `languages` (text[], nullable, default '{}') — list of spoken languages
12. `biometric_enabled` (boolean, default false) — whether biometric auth is enabled

## Security
- No new RLS policies needed — the existing `profiles_select_own` and
  `profiles_update_own` policies already cover all columns on the table.
- All columns are nullable to allow incremental profile completion.
- Uses IF NOT EXISTS checks so the migration is safe to re-run.

## Notes
1. The `languages` column uses PostgreSQL `text[]` (array type) so users
   can store multiple languages in a single column.
2. `biometric_enabled` defaults to `false` so biometric auth is opt-in.
3. `date_of_birth` uses the `date` type (not timestamptz) since we only
   need the calendar date, not a timestamp.
*/

-- Add columns one at a time with IF NOT EXISTS guards for idempotency
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS date_of_birth date;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS gender text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS blood_group text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS nationality text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS address text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS occupation text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS marital_status text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS religion text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS emergency_contact text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS languages text[] DEFAULT '{}';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS biometric_enabled boolean DEFAULT false;

-- Create index on date_of_birth for potential birthday reminder queries
CREATE INDEX IF NOT EXISTS idx_profiles_date_of_birth ON public.profiles(date_of_birth);