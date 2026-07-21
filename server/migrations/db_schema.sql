-- SQL migration for Reel254 new social and AI features (stage 1: DB schema)
-- Run this migration with your database system (e.g., Supabase PostgreSQL)

-- Users table extension (add profile fields)
ALTER TABLE users
  ADD COLUMN bio TEXT,
  ADD COLUMN avatar_url TEXT,
  ADD COLUMN location TEXT;

-- Followers relationship
CREATE TABLE followers (
  id BIGSERIAL PRIMARY KEY,
  follower_id UUID REFERENCES users(id) ON DELETE CASCADE,
  followed_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Activity feed items
CREATE TABLE activities (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- e.g., 'follow', 'like', 'collect'
  target_id UUID, -- reference to movies, collections, etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Collections and items
CREATE TABLE collections (
  id BIGSERIAL PRIMARY KEY,
  owner_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE collection_items (
  id BIGSERIAL PRIMARY KEY,
  collection_id BIGINT REFERENCES collections(id) ON DELETE CASCADE,
  movie_id UUID NOT NULL, -- assumes movies are stored elsewhere
  added_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Mood tags and user selections
CREATE TABLE moods (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT
);

CREATE TABLE user_moods (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  mood_id BIGINT REFERENCES moods(id) ON DELETE CASCADE,
  selected_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Achievements and user achievements
CREATE TABLE achievements (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  icon TEXT -- URL or icon name
);

CREATE TABLE user_achievements (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  achievement_id BIGINT REFERENCES achievements(id) ON DELETE CASCADE,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Voting for movie-night decisions
CREATE TABLE votes (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  movie_id UUID NOT NULL,
  vote_type TEXT NOT NULL, -- e.g., 'yes', 'no', 'maybe'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Watch‑party scheduling
CREATE TABLE watch_parties (
  id BIGSERIAL PRIMARY KEY,
  host_id UUID REFERENCES users(id) ON DELETE CASCADE,
  movie_id UUID NOT NULL,
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Spoiler‑safe discussions
CREATE TABLE discussions (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  movie_id UUID NOT NULL,
  content TEXT NOT NULL,
  spoiler_flag BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Optional cache table for AI recommendations (mocked for now)
CREATE TABLE ai_recommendations (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  recommendations JSONB,
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Indexes for performance
CREATE INDEX idx_followers_followed ON followers(followed_id);
CREATE INDEX idx_activities_user ON activities(user_id);
CREATE INDEX idx_votes_movie ON votes(movie_id);
CREATE INDEX idx_watch_parties_schedule ON watch_parties(scheduled_at);
CREATE INDEX idx_discussions_movie ON discussions(movie_id);
