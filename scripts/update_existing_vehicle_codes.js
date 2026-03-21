import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

function generateRandomCode(length = 12) {
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

async function updateExistingVehicles() {
  console.log('Fetching all vehicles...');
  const { data: vehicles, error: fetchError } = await supabase
    .from('vehicles')
    .select('id, name, code');

  if (fetchError) {
    console.error('Error fetching vehicles:', fetchError);
    return;
  }

  console.log(`Found ${vehicles.length} vehicles. Updating codes...`);

  for (const vehicle of vehicles) {
    const newCode = generateRandomCode(12);
    console.log(`Updating vehicle "${vehicle.name}" (${vehicle.id}): ${vehicle.code} -> ${newCode}`);
    
    const { error: updateError } = await supabase
      .from('vehicles')
      .update({ code: newCode })
      .eq('id', vehicle.id);

    if (updateError) {
      console.error(`Failed to update ${vehicle.id}:`, updateError);
    }
  }

  console.log('Finished updating existing vehicles.');
}

updateExistingVehicles();
