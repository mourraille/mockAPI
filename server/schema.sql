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