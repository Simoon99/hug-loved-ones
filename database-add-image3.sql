-- Add image3_url column to images table to support up to 3 input images
-- According to Gemini documentation, the model works best with up to 3 input images

ALTER TABLE images ADD COLUMN IF NOT EXISTS image3_url TEXT;

-- Add a comment to the column
COMMENT ON COLUMN images.image3_url IS 'Third optional input image URL (Gemini supports up to 3 images)';

