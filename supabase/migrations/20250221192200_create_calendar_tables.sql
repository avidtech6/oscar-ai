-- Create events table for calendar functionality
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  color TEXT DEFAULT 'bg-blue-500',
  project_id TEXT,
  client_id TEXT,
  user_id UUID REFERENCES auth.users(id) DEFAULT auth.uid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_events_start_time ON events(start_time);
CREATE INDEX IF NOT EXISTS idx_events_user_id ON events(user_id);
CREATE INDEX IF NOT EXISTS idx_events_project_id ON events(project_id);

-- Create projects table (mirroring IndexedDB schema)
CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  location TEXT,
  client TEXT,
  is_dummy BOOLEAN DEFAULT FALSE,
  user_id UUID REFERENCES auth.users(id) DEFAULT auth.uid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create reports table (mirroring IndexedDB schema)
CREATE TABLE IF NOT EXISTS reports (
  id TEXT PRIMARY KEY,
  project_id TEXT,
  title TEXT NOT NULL,
  type TEXT CHECK (type IN ('bs5837', 'impact', 'method')),
  content TEXT, -- HTML content
  pdf_blob BYTEA, -- Binary PDF data
  is_dummy BOOLEAN DEFAULT FALSE,
  user_id UUID REFERENCES auth.users(id) DEFAULT auth.uid(),
  generated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create clients table
CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  notes TEXT,
  user_id UUID REFERENCES auth.users(id) DEFAULT auth.uid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

-- Create policies for events
CREATE POLICY "Users can view their own events" ON events
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own events" ON events
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own events" ON events
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own events" ON events
  FOR DELETE USING (auth.uid() = user_id);

-- Create policies for projects
CREATE POLICY "Users can view their own projects" ON projects
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own projects" ON projects
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own projects" ON projects
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own projects" ON projects
  FOR DELETE USING (auth.uid() = user_id);

-- Create policies for reports
CREATE POLICY "Users can view their own reports" ON reports
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own reports" ON reports
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reports" ON reports
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reports" ON reports
  FOR DELETE USING (auth.uid() = user_id);

-- Create policies for clients
CREATE POLICY "Users can view their own clients" ON clients
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own clients" ON clients
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own clients" ON clients
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own clients" ON clients
  FOR DELETE USING (auth.uid() = user_id);

-- Create functions for automatic updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON events
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clients_updated_at
  BEFORE UPDATE ON clients
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert some sample data for development
INSERT INTO events (title, description, start_time, end_time, color, project_id)
VALUES 
  ('Site Visit - Oak Park', 'Initial site assessment for Oak Park development', '2026-02-21 10:00:00+00', '2026-02-21 12:00:00+00', 'bg-green-500', 'sample-project-1'),
  ('Client Meeting - Smith Residence', 'Review tree survey findings with client', '2026-02-22 14:00:00+00', '2026-02-22 15:30:00+00', 'bg-blue-500', 'sample-project-2'),
  ('Report Deadline - Willow Project', 'Final report submission deadline', '2026-02-22 17:00:00+00', '2026-02-22 18:00:00+00', 'bg-red-500', 'sample-project-3'),
  ('Team Sync', 'Weekly team coordination meeting', '2026-02-23 09:00:00+00', '2026-02-23 10:00:00+00', 'bg-purple-500', NULL),
  ('Planning Session', 'Project planning and resource allocation', '2026-02-21 09:00:00+00', '2026-02-21 10:00:00+00', 'bg-yellow-500', NULL)
ON CONFLICT (id) DO NOTHING;

INSERT INTO projects (id, name, description, location, client, is_dummy)
VALUES 
  ('sample-project-1', 'Oak Park Development', 'Large residential development with mature trees', '123 Oak Street, London', 'Oakwood Properties Ltd', TRUE),
  ('sample-project-2', 'Smith Residence', 'Private residence tree survey and management plan', '45 Maple Avenue, Surrey', 'John Smith', TRUE),
  ('sample-project-3', 'Willow Project', 'Commercial site tree impact assessment', 'Willow Business Park, Manchester', 'Willow Developments PLC', TRUE)
ON CONFLICT (id) DO NOTHING;

INSERT INTO clients (name, email, phone, address, notes)
VALUES 
  ('Oakwood Properties Ltd', 'contact@oakwoodproperties.com', '+44 20 7123 4567', '123 Oak Street, London, UK', 'Commercial developer, multiple projects'),
  ('John Smith', 'john.smith@example.com', '+44 7890 123456', '45 Maple Avenue, Surrey, UK', 'Private homeowner, concerned about tree health'),
  ('Willow Developments PLC', 'info@willowdev.co.uk', '+44 161 555 7890', 'Willow Business Park, Manchester, UK', 'Large commercial developer')
ON CONFLICT (id) DO NOTHING;