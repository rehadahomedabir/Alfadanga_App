import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://idqeflsxwdgtejnggski.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlkcWVmbHN4d2RndGVqbmdnc2tpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI3MjA4MzcsImV4cCI6MjA4ODI5NjgzN30.6HQh_vnokBDCPIDy4BuNqm3WVH6yVZO9ucTw5526TNo';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
