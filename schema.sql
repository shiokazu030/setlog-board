CREATE TABLE IF NOT EXISTS posts (
  id TEXT PRIMARY KEY,
  nickname TEXT NOT NULL,
  setlog_id TEXT NOT NULL,
  age_group TEXT NOT NULL,
  face_option TEXT NOT NULL,
  tags TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  reported INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_posts_visible ON posts (reported, expires_at, created_at);
CREATE INDEX IF NOT EXISTS idx_posts_reported ON posts (reported, created_at);
