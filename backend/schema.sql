-- Localization Management System Database Schema
-- This file contains the SQL commands to set up the required tables in Supabase

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    default_language VARCHAR(10) NOT NULL,
    supported_languages TEXT[] NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Constraints
    CONSTRAINT projects_name_not_empty CHECK (LENGTH(TRIM(name)) > 0),
    CONSTRAINT projects_default_language_not_empty CHECK (LENGTH(TRIM(default_language)) > 0)
);

-- Translation keys table
CREATE TABLE IF NOT EXISTS translation_keys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    key VARCHAR(500) NOT NULL,
    category VARCHAR(100) NOT NULL,
    description TEXT,
    translations JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT translation_keys_key_not_empty CHECK (LENGTH(TRIM(key)) > 0),
    CONSTRAINT translation_keys_category_not_empty CHECK (LENGTH(TRIM(category)) > 0),
    CONSTRAINT translation_keys_unique_key_per_project UNIQUE (project_id, key)
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_projects_active ON projects(is_active);
CREATE INDEX IF NOT EXISTS idx_projects_created_by ON projects(created_by);
CREATE INDEX IF NOT EXISTS idx_translation_keys_project_id ON translation_keys(project_id);
CREATE INDEX IF NOT EXISTS idx_translation_keys_category ON translation_keys(category);
CREATE INDEX IF NOT EXISTS idx_translation_keys_key ON translation_keys(key);
CREATE INDEX IF NOT EXISTS idx_translation_keys_translations ON translation_keys USING GIN (translations);

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers to automatically update updated_at
CREATE TRIGGER update_projects_updated_at 
    BEFORE UPDATE ON projects 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_translation_keys_updated_at 
    BEFORE UPDATE ON translation_keys 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) policies
-- Enable RLS on tables
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE translation_keys ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies (adjust based on your authentication needs)
-- For now, allow all operations for authenticated users
CREATE POLICY "Allow all operations for authenticated users" ON projects
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all operations for authenticated users" ON translation_keys
    FOR ALL USING (auth.role() = 'authenticated');



-- Sample data for testing (optional)
-- Uncomment the following lines to insert sample data
/*
-- Insert sample projects
INSERT INTO projects (name, description, default_language, supported_languages, created_by) VALUES
('E-commerce Website', 'Main e-commerce platform translations', 'en', ARRAY['en', 'es', 'fr', 'de'], 'demo-user'),
('Mobile App', 'iOS and Android app translations', 'en', ARRAY['en', 'es', 'zh'], 'demo-user'),
('Marketing Site', 'Company marketing website', 'en', ARRAY['en', 'es', 'fr'], 'demo-user');

-- Insert sample translation keys
WITH project_ids AS (
    SELECT id, name FROM projects WHERE created_by = 'demo-user'
)
INSERT INTO translation_keys (project_id, key, category, description, translations)
SELECT 
    p.id,
    'button.save',
    'buttons',
    'Save button text',
    jsonb_build_object(
        'en', jsonb_build_object('value', 'Save', 'updated_at', NOW(), 'updated_by', 'demo-user'),
        'es', jsonb_build_object('value', 'Guardar', 'updated_at', NOW(), 'updated_by', 'demo-user'),
        'fr', jsonb_build_object('value', 'Sauvegarder', 'updated_at', NOW(), 'updated_by', 'demo-user')
    )
FROM project_ids p
WHERE p.name = 'E-commerce Website'

UNION ALL

SELECT 
    p.id,
    'button.cancel',
    'buttons',
    'Cancel button text',
    jsonb_build_object(
        'en', jsonb_build_object('value', 'Cancel', 'updated_at', NOW(), 'updated_by', 'demo-user'),
        'es', jsonb_build_object('value', 'Cancelar', 'updated_at', NOW(), 'updated_by', 'demo-user'),
        'fr', jsonb_build_object('value', 'Annuler', 'updated_at', NOW(), 'updated_by', 'demo-user')
    )
FROM project_ids p
WHERE p.name = 'E-commerce Website'

UNION ALL

SELECT 
    p.id,
    'navigation.home',
    'navigation',
    'Home navigation link',
    jsonb_build_object(
        'en', jsonb_build_object('value', 'Home', 'updated_at', NOW(), 'updated_by', 'demo-user'),
        'es', jsonb_build_object('value', 'Inicio', 'updated_at', NOW(), 'updated_by', 'demo-user'),
        'fr', jsonb_build_object('value', 'Accueil', 'updated_at', NOW(), 'updated_by', 'demo-user')
    )
FROM project_ids p
WHERE p.name = 'E-commerce Website';
*/ 