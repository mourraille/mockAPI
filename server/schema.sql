-- Create endpoints table if it doesn't exist
CREATE TABLE IF NOT EXISTS endpoints (
  id TEXT PRIMARY KEY,
  path TEXT NOT NULL,
  response TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_endpoints_path ON endpoints(path);

-- Create users table if it doesn't exist
CREATE TABLE IF NOT EXISTS users (
  uid TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  display_name TEXT,
  photo_url TEXT,
  provider TEXT NOT NULL,
  last_login TEXT NOT NULL,
  created_at TEXT NOT NULL
);

-- Add index on user email
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email); 