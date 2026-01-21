-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create businesses table
CREATE TABLE businesses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  branding JSONB DEFAULT '{
    "primaryColor": "#6366f1",
    "secondaryColor": "#ec4899",
    "logoUrl": "",
    "businessName": "My Academy",
    "heroImage": "",
    "borderRadius": "12px"
  }'::jsonb,
  ai_config JSONB DEFAULT '{
    "systemPrompt": "You are a helpful assistant for this academy.",
    "capabilities": ["chat", "scheduling", "faq"]
  }'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create profiles table (unified user record)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('OWNER', 'INSTRUCTOR', 'STUDENT')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create classes table
CREATE TABLE classes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  instructor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  time TEXT NOT NULL,
  capacity INTEGER NOT NULL DEFAULT 20,
  type TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create enrollments table
CREATE TABLE enrollments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('Active', 'Paused', 'Expired')) DEFAULT 'Active',
  enrollment_date TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, class_id)
);

-- Create leads table
CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  source TEXT NOT NULL CHECK (source IN ('Instagram', 'Website', 'Walk-in', 'Facebook')),
  status TEXT NOT NULL CHECK (status IN ('New', 'Contacted', 'Trial Booked', 'Converted')) DEFAULT 'New',
  date TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create knowledge_sources table
CREATE TABLE knowledge_sources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('PDF', 'DOC', 'URL')),
  content TEXT,
  status TEXT NOT NULL CHECK (status IN ('Indexed', 'Processing')) DEFAULT 'Processing',
  upload_date TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create payments table
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  date TIMESTAMPTZ DEFAULT NOW(),
  status TEXT NOT NULL CHECK (status IN ('Succeeded', 'Pending', 'Failed')) DEFAULT 'Pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create automations table
CREATE TABLE automations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  description TEXT NOT NULL,
  enabled BOOLEAN DEFAULT false,
  type TEXT NOT NULL CHECK (type IN ('WhatsApp', 'Push', 'Email')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create ai_threads table
CREATE TABLE ai_threads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  messages JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_profiles_business_id ON profiles(business_id);
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_classes_business_id ON classes(business_id);
CREATE INDEX idx_enrollments_business_id ON enrollments(business_id);
CREATE INDEX idx_enrollments_student_id ON enrollments(student_id);
CREATE INDEX idx_leads_business_id ON leads(business_id);
CREATE INDEX idx_knowledge_sources_business_id ON knowledge_sources(business_id);
CREATE INDEX idx_payments_business_id ON payments(business_id);
CREATE INDEX idx_automations_business_id ON automations(business_id);
CREATE INDEX idx_ai_threads_business_id ON ai_threads(business_id);

-- Create Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE automations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_threads ENABLE ROW LEVEL SECURITY;

-- Businesses policies
CREATE POLICY "Users can view their own business"
  ON businesses FOR SELECT
  USING (owner_id = auth.uid());

CREATE POLICY "Users can update their own business"
  ON businesses FOR UPDATE
  USING (owner_id = auth.uid());

CREATE POLICY "Users can insert their own business"
  ON businesses FOR INSERT
  WITH CHECK (owner_id = auth.uid());

-- Profiles policies
CREATE POLICY "Users can view profiles in their business"
  ON profiles FOR SELECT
  USING (
    business_id IN (
      SELECT id FROM businesses WHERE owner_id = auth.uid()
    )
    OR id = auth.uid()
  );

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (id = auth.uid());

CREATE POLICY "Users can insert profiles in their business"
  ON profiles FOR INSERT
  WITH CHECK (
    business_id IN (
      SELECT id FROM businesses WHERE owner_id = auth.uid()
    )
  );

-- Classes policies
CREATE POLICY "Users can view classes in their business"
  ON classes FOR SELECT
  USING (
    business_id IN (
      SELECT business_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Owners can manage classes"
  ON classes FOR ALL
  USING (
    business_id IN (
      SELECT id FROM businesses WHERE owner_id = auth.uid()
    )
  );

-- Enrollments policies
CREATE POLICY "Users can view enrollments in their business"
  ON enrollments FOR SELECT
  USING (
    business_id IN (
      SELECT business_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Owners can manage enrollments"
  ON enrollments FOR ALL
  USING (
    business_id IN (
      SELECT id FROM businesses WHERE owner_id = auth.uid()
    )
  );

-- Leads policies
CREATE POLICY "Users can view leads in their business"
  ON leads FOR SELECT
  USING (
    business_id IN (
      SELECT business_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Owners can manage leads"
  ON leads FOR ALL
  USING (
    business_id IN (
      SELECT id FROM businesses WHERE owner_id = auth.uid()
    )
  );

-- Knowledge sources policies
CREATE POLICY "Users can view knowledge sources in their business"
  ON knowledge_sources FOR SELECT
  USING (
    business_id IN (
      SELECT business_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Owners can manage knowledge sources"
  ON knowledge_sources FOR ALL
  USING (
    business_id IN (
      SELECT id FROM businesses WHERE owner_id = auth.uid()
    )
  );

-- Payments policies
CREATE POLICY "Users can view payments in their business"
  ON payments FOR SELECT
  USING (
    business_id IN (
      SELECT business_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Owners can manage payments"
  ON payments FOR ALL
  USING (
    business_id IN (
      SELECT id FROM businesses WHERE owner_id = auth.uid()
    )
  );

-- Automations policies
CREATE POLICY "Users can view automations in their business"
  ON automations FOR SELECT
  USING (
    business_id IN (
      SELECT business_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Owners can manage automations"
  ON automations FOR ALL
  USING (
    business_id IN (
      SELECT id FROM businesses WHERE owner_id = auth.uid()
    )
  );

-- AI threads policies
CREATE POLICY "Users can view their own AI threads"
  ON ai_threads FOR SELECT
  USING (
    student_id = auth.uid()
    OR business_id IN (
      SELECT id FROM businesses WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Students can create their own AI threads"
  ON ai_threads FOR INSERT
  WITH CHECK (student_id = auth.uid());

CREATE POLICY "Students can update their own AI threads"
  ON ai_threads FOR UPDATE
  USING (student_id = auth.uid());

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers to all tables
CREATE TRIGGER update_businesses_updated_at BEFORE UPDATE ON businesses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_classes_updated_at BEFORE UPDATE ON classes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_enrollments_updated_at BEFORE UPDATE ON enrollments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON leads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_knowledge_sources_updated_at BEFORE UPDATE ON knowledge_sources
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_automations_updated_at BEFORE UPDATE ON automations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_threads_updated_at BEFORE UPDATE ON ai_threads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
