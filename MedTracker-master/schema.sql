-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if they exist
DROP TABLE IF EXISTS medications;
DROP TABLE IF EXISTS prescriptions;

-- Medications table
CREATE TABLE medications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  name TEXT NOT NULL,
  dosage TEXT,
  notes TEXT,
  days INTEGER[] NOT NULL,
  times TEXT[] NOT NULL,
  taken JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Prescriptions table
CREATE TABLE prescriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  image_url TEXT NOT NULL,
  extracted_text TEXT,
  medications_identified JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
); 