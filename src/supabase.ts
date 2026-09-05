import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL || 'https://davgzdedqhkgmydzvvcy.supabase.co';
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRhdmd6ZGVkcWhrZ215ZHp2dmN5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQwNTc1ODEsImV4cCI6MjA4OTYzMzU4MX0.tdJFt8l-4siMS3ljUJjBSBBDi4hJwhzMKR4ZQPXddrI';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
