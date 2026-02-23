-- Create notes table
CREATE TABLE IF NOT EXISTS notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT,
  type TEXT CHECK (type IN ('general', 'voice', 'field')) DEFAULT 'general',
  tags TEXT[] DEFAULT '{}',
  transcript TEXT,
  is_dummy BOOLEAN DEFAULT FALSE,
  user_id UUID REFERENCES auth.users(id) DEFAULT auth.uid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create trees table
CREATE TABLE IF NOT EXISTS trees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id TEXT NOT NULL,
  number TEXT,
  species TEXT NOT NULL,
  scientific_name TEXT,
  dbh INTEGER, -- Diameter at Breast Height in mm
  height NUMERIC, -- Height in meters
  age TEXT,
  category TEXT CHECK (category IN ('A', 'B', 'C', 'U', '')) DEFAULT '',
  condition TEXT,
  notes TEXT,
  photos TEXT[] DEFAULT '{}',
  rpa INTEGER, -- Root Protection Area in mm
  is_dummy BOOLEAN DEFAULT FALSE,
  user_id UUID REFERENCES auth.users(id) DEFAULT auth.uid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create photos table for Supabase storage references
CREATE TABLE IF NOT EXISTS photo_references (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id TEXT NOT NULL,
  tree_id UUID REFERENCES trees(id) ON DELETE CASCADE,
  note_id UUID REFERENCES notes(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  filename TEXT NOT NULL,
  mime_type TEXT,
  size INTEGER,
  user_id UUID REFERENCES auth.users(id) DEFAULT auth.uid(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_notes_project_id ON notes(project_id);
CREATE INDEX IF NOT EXISTS idx_notes_user_id ON notes(user_id);
CREATE INDEX IF NOT EXISTS idx_notes_created_at ON notes(created_at);
CREATE INDEX IF NOT EXISTS idx_notes_tags ON notes USING GIN(tags);

CREATE INDEX IF NOT EXISTS idx_trees_project_id ON trees(project_id);
CREATE INDEX IF NOT EXISTS idx_trees_user_id ON trees(user_id);
CREATE INDEX IF NOT EXISTS idx_trees_species ON trees(species);
CREATE INDEX IF NOT EXISTS idx_trees_category ON trees(category);

CREATE INDEX IF NOT EXISTS idx_photo_references_project_id ON photo_references(project_id);
CREATE INDEX IF NOT EXISTS idx_photo_references_tree_id ON photo_references(tree_id);
CREATE INDEX IF NOT EXISTS idx_photo_references_note_id ON photo_references(note_id);
CREATE INDEX IF NOT EXISTS idx_photo_references_user_id ON photo_references(user_id);

-- Enable Row Level Security
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE trees ENABLE ROW LEVEL SECURITY;
ALTER TABLE photo_references ENABLE ROW LEVEL SECURITY;

-- Create policies for notes
CREATE POLICY "Users can view their own notes" ON notes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own notes" ON notes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own notes" ON notes
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notes" ON notes
  FOR DELETE USING (auth.uid() = user_id);

-- Create policies for trees
CREATE POLICY "Users can view their own trees" ON trees
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own trees" ON trees
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own trees" ON trees
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own trees" ON trees
  FOR DELETE USING (auth.uid() = user_id);

-- Create policies for photo_references
CREATE POLICY "Users can view their own photo references" ON photo_references
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own photo references" ON photo_references
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own photo references" ON photo_references
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own photo references" ON photo_references
  FOR DELETE USING (auth.uid() = user_id);

-- Create triggers for automatic updated_at
CREATE TRIGGER update_notes_updated_at
  BEFORE UPDATE ON notes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_trees_updated_at
  BEFORE UPDATE ON trees
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data for development
INSERT INTO notes (project_id, title, content, type, tags, is_dummy)
VALUES 
  ('sample-project-1', 'Site Visit Notes', 'Initial site assessment completed. Several mature oaks need attention.', 'field', ARRAY['site-visit', 'assessment'], TRUE),
  ('sample-project-1', 'Client Meeting Summary', 'Client agreed to proceed with recommended works.', 'general', ARRAY['meeting', 'client'], TRUE),
  ('sample-project-2', 'Tree Health Issues', 'Noticed signs of fungal infection on the maple tree.', 'field', ARRAY['health', 'fungus'], TRUE)
ON CONFLICT (id) DO NOTHING;

INSERT INTO trees (project_id, number, species, scientific_name, dbh, height, age, category, condition, notes, is_dummy)
VALUES 
  ('sample-project-1', 'T1', 'Oak', 'Quercus robur', 850, 22.5, 'Mature', 'A', 'Good', 'Healthy specimen with good form.', TRUE),
  ('sample-project-1', 'T2', 'Beech', 'Fagus sylvatica', 650, 18.0, 'Mature', 'B', 'Fair', 'Some deadwood in crown.', TRUE),
  ('sample-project-2', 'T1', 'Maple', 'Acer pseudoplatanus', 450, 15.0, 'Semi-mature', 'C', 'Poor', 'Signs of fungal infection.', TRUE)
ON CONFLICT (id) DO NOTHING;