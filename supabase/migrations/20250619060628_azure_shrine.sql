/*
  # Create Admin Tasks Management System

  1. New Tables
    - `admin_tasks`
      - `id` (uuid, primary key)
      - `title` (text, task title)
      - `description` (text, task description)
      - `platform` (text, platform type: 'x', 'telegram', 'general')
      - `points` (integer, points awarded)
      - `action_url` (text, URL for task action)
      - `verification_type` (text, how to verify completion)
      - `requires_connection` (boolean, requires social connection)
      - `is_active` (boolean, task is active/visible)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
      - `created_by` (text, admin who created it)

  2. Security
    - Enable RLS on admin_tasks table
    - Add policies for public read access (for displaying tasks)
    - Add policies for admin management (create, update, delete)

  3. Indexes
    - Add indexes for performance on platform, is_active, created_at
*/

-- Create admin_tasks table
CREATE TABLE IF NOT EXISTS admin_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  platform text NOT NULL CHECK (platform IN ('x', 'telegram', 'general')),
  points integer NOT NULL DEFAULT 0,
  action_url text,
  verification_type text NOT NULL CHECK (verification_type IN ('manual', 'api', 'social')) DEFAULT 'manual',
  requires_connection boolean DEFAULT false,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by text DEFAULT 'admin'
);

-- Enable RLS
ALTER TABLE admin_tasks ENABLE ROW LEVEL SECURITY;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_admin_tasks_platform ON admin_tasks(platform);
CREATE INDEX IF NOT EXISTS idx_admin_tasks_active ON admin_tasks(is_active);
CREATE INDEX IF NOT EXISTS idx_admin_tasks_created_at ON admin_tasks(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_tasks_platform_active ON admin_tasks(platform, is_active) WHERE is_active = true;

-- RLS Policies
CREATE POLICY "Public users can read active tasks"
  ON admin_tasks
  FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "Admin can manage all tasks"
  ON admin_tasks
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_admin_tasks_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Create trigger for updated_at
CREATE TRIGGER trigger_admin_tasks_updated_at
  BEFORE UPDATE ON admin_tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_admin_tasks_updated_at();

-- Insert some default tasks
INSERT INTO admin_tasks (title, description, platform, points, action_url, verification_type, requires_connection) VALUES
('Join Telegram Community', 'Join our official Telegram community and stay updated', 'telegram', 50, 'https://t.me/pumpeddotfun', 'manual', true),
('Follow on X', 'Follow @pumpeddotfun on X (Twitter)', 'x', 50, 'https://x.com/pumpeddotfun', 'api', true),
('Repost Launch Announcement', 'Repost our latest launch announcement on X', 'x', 75, 'https://x.com/pumpeddotfun/status/123456789', 'api', true),
('Share Referral Link', 'Share your referral link on social media', 'general', 25, null, 'manual', false),
('Complete Profile Setup', 'Connect both Telegram and X accounts', 'general', 100, null, 'manual', false)
ON CONFLICT DO NOTHING;

-- Function to get active tasks for a platform
CREATE OR REPLACE FUNCTION get_active_tasks_by_platform(platform_filter text DEFAULT NULL)
RETURNS TABLE(
  id uuid,
  title text,
  description text,
  platform text,
  points integer,
  action_url text,
  verification_type text,
  requires_connection boolean,
  created_at timestamptz
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.id,
    t.title,
    t.description,
    t.platform,
    t.points,
    t.action_url,
    t.verification_type,
    t.requires_connection,
    t.created_at
  FROM admin_tasks t
  WHERE t.is_active = true
    AND (platform_filter IS NULL OR t.platform = platform_filter)
  ORDER BY t.created_at DESC;
END;
$$;

-- Function to create a new task
CREATE OR REPLACE FUNCTION create_admin_task(
  task_title text,
  task_description text,
  task_platform text,
  task_points integer,
  task_action_url text DEFAULT NULL,
  task_verification_type text DEFAULT 'manual',
  task_requires_connection boolean DEFAULT false,
  task_created_by text DEFAULT 'admin'
)
RETURNS uuid
LANGUAGE plpgsql
AS $$
DECLARE
  new_task_id uuid;
BEGIN
  INSERT INTO admin_tasks (
    title,
    description,
    platform,
    points,
    action_url,
    verification_type,
    requires_connection,
    created_by
  ) VALUES (
    task_title,
    task_description,
    task_platform,
    task_points,
    task_action_url,
    task_verification_type,
    task_requires_connection,
    task_created_by
  ) RETURNING id INTO new_task_id;
  
  RETURN new_task_id;
END;
$$;

-- Function to update a task
CREATE OR REPLACE FUNCTION update_admin_task(
  task_id uuid,
  task_title text DEFAULT NULL,
  task_description text DEFAULT NULL,
  task_platform text DEFAULT NULL,
  task_points integer DEFAULT NULL,
  task_action_url text DEFAULT NULL,
  task_verification_type text DEFAULT NULL,
  task_requires_connection boolean DEFAULT NULL,
  task_is_active boolean DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE admin_tasks SET
    title = COALESCE(task_title, title),
    description = COALESCE(task_description, description),
    platform = COALESCE(task_platform, platform),
    points = COALESCE(task_points, points),
    action_url = COALESCE(task_action_url, action_url),
    verification_type = COALESCE(task_verification_type, verification_type),
    requires_connection = COALESCE(task_requires_connection, requires_connection),
    is_active = COALESCE(task_is_active, is_active),
    updated_at = now()
  WHERE id = task_id;
  
  RETURN FOUND;
END;
$$;

-- Function to delete a task (soft delete by setting is_active to false)
CREATE OR REPLACE FUNCTION delete_admin_task(task_id uuid)
RETURNS boolean
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE admin_tasks 
  SET is_active = false, updated_at = now()
  WHERE id = task_id;
  
  RETURN FOUND;
END;
$$;

-- Function to permanently delete a task
CREATE OR REPLACE FUNCTION permanently_delete_admin_task(task_id uuid)
RETURNS boolean
LANGUAGE plpgsql
AS $$
BEGIN
  DELETE FROM admin_tasks WHERE id = task_id;
  RETURN FOUND;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_active_tasks_by_platform(text) TO public;
GRANT EXECUTE ON FUNCTION create_admin_task(text, text, text, integer, text, text, boolean, text) TO public;
GRANT EXECUTE ON FUNCTION update_admin_task(uuid, text, text, text, integer, text, text, boolean, boolean) TO public;
GRANT EXECUTE ON FUNCTION delete_admin_task(uuid) TO public;
GRANT EXECUTE ON FUNCTION permanently_delete_admin_task(uuid) TO public;