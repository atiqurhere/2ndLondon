-- Migration 007: RLS Policies for Social Network

-- Enable RLS on all tables
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_reaction_counts ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_saves ENABLE ROW LEVEL SECURITY;

-- ============================================
-- POSTS POLICIES
-- ============================================

-- Read: authenticated users can see non-deleted posts
CREATE POLICY "Posts are viewable by authenticated users"
ON posts FOR SELECT
TO authenticated
USING (is_deleted = FALSE);

-- Insert: users can create their own posts
CREATE POLICY "Users can create posts"
ON posts FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = author_id);

-- Update: users can update their own posts
CREATE POLICY "Users can update own posts"
ON posts FOR UPDATE
TO authenticated
USING (auth.uid() = author_id)
WITH CHECK (auth.uid() = author_id);

-- Delete: users can soft delete their own posts
CREATE POLICY "Users can delete own posts"
ON posts FOR DELETE
TO authenticated
USING (auth.uid() = author_id);

-- ============================================
-- POST ATTACHMENTS POLICIES
-- ============================================

-- Read: authenticated users can view attachments
CREATE POLICY "Attachments viewable by authenticated"
ON post_attachments FOR SELECT
TO authenticated
USING (TRUE);

-- Insert: users can upload to their own posts
CREATE POLICY "Users can upload to own posts"
ON post_attachments FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = uploader_id);

-- Delete: users can delete attachments from their own posts
CREATE POLICY "Users can delete own attachments"
ON post_attachments FOR DELETE
TO authenticated
USING (auth.uid() = uploader_id);

-- ============================================
-- POST REACTIONS POLICIES
-- ============================================

-- Read: authenticated users can view all reactions
CREATE POLICY "Reactions viewable by authenticated"
ON post_reactions FOR SELECT
TO authenticated
USING (TRUE);

-- Insert: users can add their own reactions
CREATE POLICY "Users can add reactions"
ON post_reactions FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Update: users can update their own reactions
CREATE POLICY "Users can update own reactions"
ON post_reactions FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Delete: users can remove their own reactions
CREATE POLICY "Users can remove own reactions"
ON post_reactions FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- ============================================
-- POST REACTION COUNTS POLICIES
-- ============================================

-- Read: authenticated users can view reaction counts
CREATE POLICY "Reaction counts viewable by authenticated"
ON post_reaction_counts FOR SELECT
TO authenticated
USING (TRUE);

-- Insert: allow authenticated users to insert (needed for triggers)
CREATE POLICY "Allow authenticated inserts to reaction counts"
ON post_reaction_counts FOR INSERT
TO authenticated
WITH CHECK (TRUE);

-- ============================================
-- COMMENTS POLICIES
-- ============================================

-- Read: authenticated users can see non-deleted comments
CREATE POLICY "Comments viewable by authenticated"
ON comments FOR SELECT
TO authenticated
USING (is_deleted = FALSE);

-- Insert: authenticated users can comment
CREATE POLICY "Users can create comments"
ON comments FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = author_id);

-- Update: users can update own comments
CREATE POLICY "Users can update own comments"
ON comments FOR UPDATE
TO authenticated
USING (auth.uid() = author_id)
WITH CHECK (auth.uid() = author_id);

-- Delete: users can soft delete own comments
CREATE POLICY "Users can delete own comments"
ON comments FOR DELETE
TO authenticated
USING (auth.uid() = author_id);

-- ============================================
-- FOLLOWS POLICIES
-- ============================================

-- Read: authenticated users can view all follows
CREATE POLICY "Follows viewable by authenticated"
ON follows FOR SELECT
TO authenticated
USING (TRUE);

-- Insert: users can follow others
CREATE POLICY "Users can follow others"
ON follows FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = follower_id);

-- Delete: users can unfollow
CREATE POLICY "Users can unfollow"
ON follows FOR DELETE
TO authenticated
USING (auth.uid() = follower_id);

-- ============================================
-- POST SAVES POLICIES
-- ============================================

-- Read: users can view their own saved posts
CREATE POLICY "Users can view own saved posts"
ON post_saves FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Insert: users can save posts
CREATE POLICY "Users can save posts"
ON post_saves FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Delete: users can unsave posts
CREATE POLICY "Users can unsave posts"
ON post_saves FOR DELETE
TO authenticated
USING (auth.uid() = user_id);
