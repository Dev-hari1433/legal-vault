/*
# Create profile-avatars storage bucket

## Summary
Creates a public Supabase Storage bucket named `profile-avatars` for
storing user profile pictures. Adds storage policies so each authenticated
user can only upload, read, update, and delete files inside their own
folder (`profile-avatars/<user_id>/`).

## Storage Policies
1. **SELECT** — anyone can view profile avatars (they're displayed publicly).
2. **INSERT** — authenticated users can upload only to their own folder.
3. **UPDATE** — authenticated users can update only files in their own folder.
4. **DELETE** — authenticated users can delete only files in their own folder.

## Notes
1. The bucket is public so avatar URLs work in <img> tags without signed URLs.
2. Folder structure: `profile-avatars/<auth.uid()>/avatar-<timestamp>.<ext>`
3. Uses `(storage.foldername(name))[1]` to extract the user_id folder prefix
   for ownership checks.
*/

INSERT INTO storage.buckets (id, name, public)
VALUES ('profile-avatars', 'profile-avatars', true)
ON CONFLICT (id) DO NOTHING;

-- SELECT: public read access for avatars
DROP POLICY IF EXISTS "avatar_public_read" ON storage.objects;
CREATE POLICY "avatar_public_read"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'profile-avatars');

-- INSERT: only owner can upload to their folder
DROP POLICY IF EXISTS "avatar_insert_own" ON storage.objects;
CREATE POLICY "avatar_insert_own"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'profile-avatars'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- UPDATE: only owner can update their folder
DROP POLICY IF EXISTS "avatar_update_own" ON storage.objects;
CREATE POLICY "avatar_update_own"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'profile-avatars'
  AND (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'profile-avatars'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- DELETE: only owner can delete their folder
DROP POLICY IF EXISTS "avatar_delete_own" ON storage.objects;
CREATE POLICY "avatar_delete_own"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'profile-avatars'
  AND (storage.foldername(name))[1] = auth.uid()::text
);