-- 1. Create Profiles Table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'blocked')),
  can_manage_users BOOLEAN DEFAULT FALSE,
  can_edit_news BOOLEAN DEFAULT FALSE,
  can_approve_services BOOLEAN DEFAULT FALSE,
  can_edit_settings BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. Create Home Settings Table
CREATE TABLE IF NOT EXISTS home_settings (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  banner_text TEXT DEFAULT 'আলফাডাঙ্গা উপজেলা ডিজিটাল পোর্টালে আপনাকে স্বাগতম',
  banner_image TEXT,
  featured_card_1_title TEXT DEFAULT 'জরুরী সেবা',
  featured_card_1_desc TEXT DEFAULT 'দ্রুত সাহায্যের জন্য এখানে ক্লিক করুন',
  featured_card_1_icon TEXT,
  featured_card_2_title TEXT DEFAULT 'আজকের খবর',
  featured_card_2_desc TEXT DEFAULT 'উপজেলার সর্বশেষ সংবাদ জানুন',
  featured_card_2_icon TEXT,
  allow_user_contribution BOOLEAN DEFAULT TRUE,
  allowed_categories TEXT[] DEFAULT '{}',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. Create Services Table
CREATE TABLE IF NOT EXISTS services (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  category TEXT NOT NULL,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  image_url TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 4. Create Pending Services Table
CREATE TABLE IF NOT EXISTS pending_services (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  category TEXT NOT NULL,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  image_url TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 5. Create News Table
CREATE TABLE IF NOT EXISTS news (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE home_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE pending_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE news ENABLE ROW LEVEL SECURITY;

-- Create Policies

-- Profiles: Users can read their own profile, Admins can read all
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
CREATE POLICY "Admins can view all profiles" ON profiles FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Home Settings: Everyone can read, Admins can update
DROP POLICY IF EXISTS "Everyone can view settings" ON home_settings;
CREATE POLICY "Everyone can view settings" ON home_settings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can update settings" ON home_settings;
CREATE POLICY "Admins can update settings" ON home_settings FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Services: Everyone can read, Admins can manage
DROP POLICY IF EXISTS "Everyone can view services" ON services;
CREATE POLICY "Everyone can view services" ON services FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage services" ON services;
CREATE POLICY "Admins can manage services" ON services FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Pending Services: Authenticated users can insert, Admins can manage
DROP POLICY IF EXISTS "Authenticated users can submit services" ON pending_services;
CREATE POLICY "Authenticated users can submit services" ON pending_services FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admins can manage pending services" ON pending_services;
CREATE POLICY "Admins can manage pending services" ON pending_services FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- News: Everyone can read, Admins can manage
DROP POLICY IF EXISTS "Everyone can view news" ON news;
CREATE POLICY "Everyone can view news" ON news FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage news" ON news;
CREATE POLICY "Admins can manage news" ON news FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- 6. Create Blood Donors Table
CREATE TABLE IF NOT EXISTS blood_donors (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name TEXT NOT NULL,
  blood_group TEXT NOT NULL,
  phone TEXT NOT NULL,
  location TEXT,
  last_donation_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 7. Create Complaints Table
CREATE TABLE IF NOT EXISTS complaints (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_id UUID REFERENCES auth.users ON DELETE SET NULL,
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'investigating', 'resolved')),
  admin_note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 8. Create Notices Table
CREATE TABLE IF NOT EXISTS notices (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  is_urgent BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 9. Create Categories Table (Dynamic)
CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  title_bn TEXT NOT NULL,
  title_en TEXT NOT NULL,
  icon_name TEXT NOT NULL,
  color_class TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  display_order INTEGER DEFAULT 0
);

-- 10. Create Activity Logs Table
CREATE TABLE IF NOT EXISTS activity_logs (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  admin_id UUID REFERENCES profiles(id),
  action TEXT NOT NULL,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 11. Create Analytics Table (Simple tracking)
CREATE TABLE IF NOT EXISTS analytics (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  event_type TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 12. Create Storage Bucket for Images
-- Note: This requires the storage schema to be active
INSERT INTO storage.buckets (id, name, public)
VALUES ('images', 'images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies
DROP POLICY IF EXISTS "Public Access to Images" ON storage.objects;
CREATE POLICY "Public Access to Images" ON storage.objects FOR SELECT USING (bucket_id = 'images');

DROP POLICY IF EXISTS "Authenticated users can upload images" ON storage.objects;
CREATE POLICY "Authenticated users can upload images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'images' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admins can delete images" ON storage.objects;
CREATE POLICY "Admins can delete images" ON storage.objects FOR DELETE USING (
  bucket_id = 'images' AND 
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Enable RLS for new tables
ALTER TABLE blood_donors ENABLE ROW LEVEL SECURITY;
ALTER TABLE complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE notices ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;

-- Policies for new tables

-- Blood Donors: Everyone can view, Authenticated can insert, Admins can manage
DROP POLICY IF EXISTS "Everyone can view blood donors" ON blood_donors;
CREATE POLICY "Everyone can view blood donors" ON blood_donors FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated can register as donor" ON blood_donors;
CREATE POLICY "Authenticated can register as donor" ON blood_donors FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admins can manage blood donors" ON blood_donors;
CREATE POLICY "Admins can manage blood donors" ON blood_donors FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Complaints: Users can view/insert own, Admins can manage all
DROP POLICY IF EXISTS "Users can view own complaints" ON complaints;
CREATE POLICY "Users can view own complaints" ON complaints FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can submit complaints" ON complaints;
CREATE POLICY "Users can submit complaints" ON complaints FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can manage complaints" ON complaints;
CREATE POLICY "Admins can manage complaints" ON complaints FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Notices: Everyone can view, Admins can manage
DROP POLICY IF EXISTS "Everyone can view notices" ON notices;
CREATE POLICY "Everyone can view notices" ON notices FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage notices" ON notices;
CREATE POLICY "Admins can manage notices" ON notices FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Categories: Everyone can view, Admins can manage
DROP POLICY IF EXISTS "Everyone can view categories" ON categories;
CREATE POLICY "Everyone can view categories" ON categories FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage categories" ON categories;
CREATE POLICY "Admins can manage categories" ON categories FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Activity Logs & Analytics: Admins only
DROP POLICY IF EXISTS "Admins can view logs" ON activity_logs;
CREATE POLICY "Admins can view logs" ON activity_logs FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

DROP POLICY IF EXISTS "Admins can view analytics" ON analytics;
CREATE POLICY "Admins can view analytics" ON analytics FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Insert default categories
INSERT INTO categories (id, title_bn, title_en, icon_name, color_class, display_order) VALUES
('doctor', 'ডাক্তার', 'Doctor', 'Stethoscope', 'bg-rose-500', 1),
('hospital', 'হাসপাতাল', 'Hospital', 'Hospital', 'bg-blue-500', 2),
('bus', 'বাস', 'Bus', 'Bus', 'bg-amber-500', 3),
('train', 'ট্রেন', 'Train', 'Train', 'bg-slate-700', 4),
('place', 'দর্শনীয় স্থান', 'Tourist Spots', 'Palmtree', 'bg-emerald-500', 5),
('fire', 'ফায়ার সার্ভিস', 'Fire Service', 'Flame', 'bg-red-600', 6),
('blood', 'রক্ত', 'Blood', 'Droplets', 'bg-red-500', 7),
('police', 'থানা-পুলিশ', 'Police', 'ShieldCheck', 'bg-indigo-600', 8)
ON CONFLICT (id) DO NOTHING;
