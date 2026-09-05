import { createClient } from '@supabase/supabase-js';
const supabase = createClient('https://davgzdedqhkgmydzvvcy.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRhdmd6ZGVkcWhrZ215ZHp2dmN5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQwNTc1ODEsImV4cCI6MjA4OTYzMzU4MX0.tdJFt8l-4siMS3ljUJjBSBBDi4hJwhzMKR4ZQPXddrI');

async function test() {
  const { data, error } = await supabase.from('profiles').insert([{ uid: 'test-user-1', displayName: 'Test' }]);
  console.log(error || data);
}
test();
