-- Remove foreign key constraint and simplify interviews table
ALTER TABLE interviews DROP CONSTRAINT IF EXISTS interviews_candidate_id_key;
ALTER TABLE interviews DROP COLUMN IF EXISTS candidate_id;

-- Add new columns for the simplified flow
ALTER TABLE interviews ADD COLUMN IF NOT EXISTS resume_content text;
ALTER TABLE interviews ADD COLUMN IF NOT EXISTS resume_suggestions jsonb;
ALTER TABLE interviews ADD COLUMN IF NOT EXISTS interview_phase text DEFAULT 'scheduled';
ALTER TABLE interviews ADD COLUMN IF NOT EXISTS role_focus text;

-- Update interviews table structure for simplified flow
UPDATE interviews SET interview_phase = 'scheduled' WHERE interview_phase IS NULL;