-- Enable Row Level Security on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE moments ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
-- Everyone can read public profile data (via public_profiles view)
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Moments policies (use public_moments view for reading)
-- Everyone can read moments
CREATE POLICY "Moments are viewable by everyone"
  ON moments FOR SELECT
  USING (true);

-- Authenticated users can create moments (with rate limiting via function)
CREATE POLICY "Authenticated users can create moments"
  ON moments FOR INSERT
  WITH CHECK (auth.uid() = creator_id);

-- Creators can update their own moments
CREATE POLICY "Creators can update own moments"
  ON moments FOR UPDATE
  USING (auth.uid() = creator_id);

-- Creators can delete their own moments
CREATE POLICY "Creators can delete own moments"
  ON moments FOR DELETE
  USING (auth.uid() = creator_id);

-- Applications policies
-- Applicants can read their own applications
CREATE POLICY "Users can view own applications"
  ON applications FOR SELECT
  USING (auth.uid() = applicant_id);

-- Moment creators can read applications for their moments
CREATE POLICY "Creators can view applications for their moments"
  ON applications FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM moments
      WHERE moments.id = applications.moment_id
      AND moments.creator_id = auth.uid()
    )
  );

-- Authenticated users can create applications
CREATE POLICY "Users can create applications"
  ON applications FOR INSERT
  WITH CHECK (auth.uid() = applicant_id);

-- Applicants can cancel their pending applications
CREATE POLICY "Applicants can cancel own pending applications"
  ON applications FOR UPDATE
  USING (
    auth.uid() = applicant_id
    AND status = 'pending'
  )
  WITH CHECK (status = 'cancelled');

-- Moment creators can accept/reject applications
CREATE POLICY "Creators can update applications for their moments"
  ON applications FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM moments
      WHERE moments.id = applications.moment_id
      AND moments.creator_id = auth.uid()
    )
  );

-- Conversations policies
-- Participants can read their conversations
CREATE POLICY "Participants can view their conversations"
  ON conversations FOR SELECT
  USING (
    auth.uid() = creator_id
    OR auth.uid() = other_id
  );

-- System creates conversations (via trigger on application acceptance)
CREATE POLICY "System can create conversations"
  ON conversations FOR INSERT
  WITH CHECK (
    auth.uid() = creator_id
    OR auth.uid() = other_id
  );

-- Participants can update conversation status
CREATE POLICY "Participants can update conversation status"
  ON conversations FOR UPDATE
  USING (
    auth.uid() = creator_id
    OR auth.uid() = other_id
  );

-- Messages policies
-- Participants can read messages in their conversations
CREATE POLICY "Participants can view messages"
  ON messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
      AND (conversations.creator_id = auth.uid() OR conversations.other_id = auth.uid())
    )
  );

-- Participants can send messages
CREATE POLICY "Participants can send messages"
  ON messages FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id
    AND EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = conversation_id
      AND (conversations.creator_id = auth.uid() OR conversations.other_id = auth.uid())
      AND conversations.status = 'open'
    )
  );

-- Reviews policies
-- Everyone can read reviews
CREATE POLICY "Reviews are viewable by everyone"
  ON reviews FOR SELECT
  USING (true);

-- Participants of completed moments can create reviews (one-time only)
CREATE POLICY "Participants can create reviews"
  ON reviews FOR INSERT
  WITH CHECK (
    auth.uid() = from_id
    AND EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.moment_id = reviews.moment_id
      AND (conversations.creator_id = auth.uid() OR conversations.other_id = auth.uid())
    )
  );

-- Reports policies
-- Users can read their own reports
CREATE POLICY "Users can view own reports"
  ON reports FOR SELECT
  USING (auth.uid() = reporter_id);

-- Admins can view all reports
CREATE POLICY "Admins can view all reports"
  ON reports FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM roles
      WHERE roles.user_id = auth.uid()
      AND roles.role = 'admin'
    )
  );

-- Authenticated users can create reports
CREATE POLICY "Users can create reports"
  ON reports FOR INSERT
  WITH CHECK (auth.uid() = reporter_id);

-- Admins can update reports
CREATE POLICY "Admins can update reports"
  ON reports FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM roles
      WHERE roles.user_id = auth.uid()
      AND roles.role = 'admin'
    )
  );

-- Notifications policies
-- Users can read their own notifications
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- System can create notifications
CREATE POLICY "System can create notifications"
  ON notifications FOR INSERT
  WITH CHECK (true);

-- Roles policies
-- Users can view their own role
CREATE POLICY "Users can view own role"
  ON roles FOR SELECT
  USING (auth.uid() = user_id);

-- Admins can view all roles
CREATE POLICY "Admins can view all roles"
  ON roles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM roles r
      WHERE r.user_id = auth.uid()
      AND r.role = 'admin'
    )
  );
