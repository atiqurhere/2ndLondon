-- Migration 009: Storage Bucket Policies for Post Attachments

-- ============================================
-- IMPORTANT: PREREQUISITES
-- ============================================
-- Before running this migration:
-- 1. Go to Supabase Dashboard → Storage
-- 2. Create new bucket: 'post_attachments'
-- 3. Set as PUBLIC bucket
-- 4. Then run this SQL

-- Note: storage.objects already has RLS enabled by Supabase
-- We just need to add our custom policies

-- ============================================
-- STORAGE POLICIES
-- ============================================

-- Public read access for post attachments (shareable posts)
DROP POLICY IF EXISTS "Public read access to post attachments" ON storage.objects;
CREATE POLICY "Public read access to post attachments"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'post_attachments');

-- Authenticated users can upload to their own folder
DROP POLICY IF EXISTS "Authenticated users can upload post attachments" ON storage.objects;
CREATE POLICY "Authenticated users can upload post attachments"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'post_attachments' 
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Users can update their own files
DROP POLICY IF EXISTS "Users can update own post attachments" ON storage.objects;
CREATE POLICY "Users can update own post attachments"
ON storage.objects FOR UPDATE
TO authenticated
USING (
    bucket_id = 'post_attachments'
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Users can delete their own files
DROP POLICY IF EXISTS "Users can delete own post attachments" ON storage.objects;
CREATE POLICY "Users can delete own post attachments"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'post_attachments'
    AND (storage.foldername(name))[1] = auth.uid()::text
);
