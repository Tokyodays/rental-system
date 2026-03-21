import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function inspect() {
  const { data, error } = await supabase
    .from('rentals')
    .select('*, vehicles(name), customers(full_name)');
  
  if (error) {
    console.error('Error:', error);
    return;
  }
  
  console.log('Total rentals found:', data.length);
  data.forEach(r => {
    console.log(`ID: ${r.id}, Status: ${r.status}, Start: ${r.start_at}, End: ${r.end_at}`);
    if (r.status === 'Completed') {
      console.log('  -> Matches Completed status');
    }
  });
}

inspect();
