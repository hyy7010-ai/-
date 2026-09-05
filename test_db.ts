import { createClient } from '@supabase/supabase-js';
const supabase = createClient(process.env.VITE_SUPABASE_URL || 'https://davgzdedqhkgmydzvvcy.supabase.co', process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRhdmd6ZGVkcWhrZ215ZHp2dmN5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQwNTc1ODEsImV4cCI6MjA4OTYzMzU4MX0.tdJFt8l-4siMS3ljUJjBSBBDi4hJwhzMKR4ZQPXddrI');
async function run() {
  const { data, error } = await supabase.from('users').select('*').limit(1);
  console.log('users:', error || data);
}
run();
