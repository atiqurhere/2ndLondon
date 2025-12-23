-- Trigger: Auto-create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, home_area)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', 'User'),
    COALESCE(NEW.raw_user_meta_data->>'home_area', 'London')
  );
  
  -- Create default user role
  INSERT INTO public.roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Trigger: Update rating average on review insert
CREATE OR REPLACE FUNCTION update_profile_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE profiles
  SET
    rating_avg = (
      SELECT AVG(rating)::NUMERIC(3,2)
      FROM reviews
      WHERE to_id = NEW.to_id
    ),
    rating_count = (
      SELECT COUNT(*)
      FROM reviews
      WHERE to_id = NEW.to_id
    )
  WHERE id = NEW.to_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_review_created
  AFTER INSERT ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_profile_rating();

-- Trigger: Create conversation on application acceptance
CREATE OR REPLACE FUNCTION handle_application_accepted()
RETURNS TRIGGER AS $$
DECLARE
  moment_creator_id UUID;
BEGIN
  -- Only proceed if status changed to 'accepted'
  IF NEW.status = 'accepted' AND (OLD.status IS NULL OR OLD.status != 'accepted') THEN
    -- Get the moment creator
    SELECT creator_id INTO moment_creator_id
    FROM moments
    WHERE id = NEW.moment_id;
    
    -- Create conversation if it doesn't exist
    INSERT INTO conversations (moment_id, creator_id, other_id)
    VALUES (NEW.moment_id, moment_creator_id, NEW.applicant_id)
    ON CONFLICT (moment_id, creator_id, other_id) DO NOTHING;
    
    -- Update moment status to matched
    UPDATE moments
    SET status = 'matched'
    WHERE id = NEW.moment_id;
    
    -- Notify applicant
    INSERT INTO notifications (user_id, type, title, body, link)
    VALUES (
      NEW.applicant_id,
      'application_accepted',
      'Application Accepted!',
      'Your application has been accepted. You can now chat.',
      '/app/inbox'
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_application_status_changed
  AFTER UPDATE ON applications
  FOR EACH ROW EXECUTE FUNCTION handle_application_accepted();

-- Trigger: Notify moment creator on new application
CREATE OR REPLACE FUNCTION notify_on_application()
RETURNS TRIGGER AS $$
DECLARE
  moment_creator_id UUID;
  moment_title TEXT;
BEGIN
  -- Get moment details
  SELECT creator_id, title INTO moment_creator_id, moment_title
  FROM moments
  WHERE id = NEW.moment_id;
  
  -- Notify creator
  INSERT INTO notifications (user_id, type, title, body, link)
  VALUES (
    moment_creator_id,
    'application_received',
    'New Application',
    'Someone applied to "' || moment_title || '"',
    '/app/moments/' || NEW.moment_id
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_application_created
  AFTER INSERT ON applications
  FOR EACH ROW EXECUTE FUNCTION notify_on_application();

-- Trigger: Notify on new message
CREATE OR REPLACE FUNCTION notify_on_message()
RETURNS TRIGGER AS $$
DECLARE
  recipient_id UUID;
  sender_name TEXT;
BEGIN
  -- Determine recipient (the other participant)
  SELECT
    CASE
      WHEN c.creator_id = NEW.sender_id THEN c.other_id
      ELSE c.creator_id
    END,
    p.display_name
  INTO recipient_id, sender_name
  FROM conversations c
  JOIN profiles p ON p.id = NEW.sender_id
  WHERE c.id = NEW.conversation_id;
  
  -- Notify recipient
  INSERT INTO notifications (user_id, type, title, body, link)
  VALUES (
    recipient_id,
    'message',
    'New Message',
    sender_name || ' sent you a message',
    '/app/inbox/' || NEW.conversation_id
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_message_created
  AFTER INSERT ON messages
  FOR EACH ROW EXECUTE FUNCTION notify_on_message();
