-- Migration 011: Notifications, Blocks, and Reports for Moments System

-- ============================================
-- NOTIFICATIONS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    body TEXT,
    link TEXT,
    actor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);

-- ============================================
-- BLOCKS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS blocks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    blocked_user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, blocked_user_id)
);

CREATE INDEX idx_blocks_user_id ON blocks(user_id);
CREATE INDEX idx_blocks_blocked_user_id ON blocks(blocked_user_id);

-- ============================================
-- REPORTS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reporter_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    reported_user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    reported_moment_id UUID REFERENCES moments(id) ON DELETE SET NULL,
    category TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'pending',
    reviewed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMPTZ,
    admin_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CHECK (category IN ('spam', 'harassment', 'inappropriate', 'scam', 'fake', 'other')),
    CHECK (status IN ('pending', 'reviewed', 'actioned', 'dismissed'))
);

CREATE INDEX idx_reports_reporter_id ON reports(reporter_id);
CREATE INDEX idx_reports_status ON reports(status);
CREATE INDEX idx_reports_created_at ON reports(created_at DESC);

-- ============================================
-- TRIGGERS FOR NOTIFICATIONS
-- ============================================

-- Trigger: Notify moment owner when someone applies
CREATE OR REPLACE FUNCTION notify_on_application()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO notifications (user_id, type, title, body, link, actor_id)
    SELECT 
        m.creator_id,
        'application_received',
        'New application for ' || m.title,
        p.display_name || ' applied to your moment',
        '/app/moment/' || NEW.moment_id,
        NEW.applicant_id
    FROM moments m
    JOIN profiles p ON p.id = NEW.applicant_id
    WHERE m.id = NEW.moment_id
    AND m.creator_id != NEW.applicant_id; -- Don't notify if applying to own moment
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_application_created
AFTER INSERT ON applications
FOR EACH ROW
EXECUTE FUNCTION notify_on_application();

-- Trigger: Notify applicant when application status changes
CREATE OR REPLACE FUNCTION notify_on_application_status_change()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status != OLD.status AND NEW.status IN ('accepted', 'rejected') THEN
        INSERT INTO notifications (user_id, type, title, body, link, actor_id)
        SELECT 
            NEW.applicant_id,
            'application_' || NEW.status,
            'Application ' || NEW.status,
            'Your application for "' || m.title || '" was ' || NEW.status,
            CASE 
                WHEN NEW.status = 'accepted' THEN '/app/messages'
                ELSE '/app/feed'
            END,
            m.creator_id
        FROM moments m
        WHERE m.id = NEW.moment_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_application_status_updated
AFTER UPDATE ON applications
FOR EACH ROW
EXECUTE FUNCTION notify_on_application_status_change();

-- ============================================
-- RLS POLICIES
-- ============================================

-- Notifications policies
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications"
ON notifications FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
ON notifications FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own notifications"
ON notifications FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Blocks policies
ALTER TABLE blocks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own blocks"
ON blocks FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can create blocks"
ON blocks FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id AND user_id != blocked_user_id);

CREATE POLICY "Users can delete own blocks"
ON blocks FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Reports policies
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own reports"
ON reports FOR SELECT
TO authenticated
USING (auth.uid() = reporter_id);

CREATE POLICY "Users can create reports"
ON reports FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = reporter_id AND reporter_id != reported_user_id);

-- Grant permissions
GRANT ALL ON notifications TO authenticated;
GRANT ALL ON blocks TO authenticated;
GRANT ALL ON reports TO authenticated;
