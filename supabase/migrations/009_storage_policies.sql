-- Migration 009: Storage Bucket Policies for Post Attachments

-- Note: Run this after creating the 'post_attachments' bucket in Supabase Dashboard

-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Public read access for post attachments (shareable posts)
CREATE POLICY "Public read access to post attachments"
ON storage.objects FOR SELECT
USING (bucket_id = 'post_attachments');

-- Authenticated users can upload to their own folder
CREATE POLICY "Authenticated users can upload post attachments"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'post_attachments' 
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Users can update their own files
CREATE POLICY "Users can update own post attachments"
ON storage.objects FOR UPDATE
USING (
    bucket_id = 'post_attachments'
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Users can delete their own files
CREATE POLICY "Users can delete own post attachments"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'post_attachments'
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- ============================================
-- INSTRUCTIONS
-- ============================================

-- 1. Go to Supabase Dashboard → Storage
-- 2. Create new bucket: 'post_attachments'
-- 3. Set as PUBLIC bucket
-- 4. Run this SQL in SQL Editor
-- 5. Test upload with path: {userId}/{postId}/{filename}
