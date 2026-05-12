
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '../backend/.env' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('URL:', supabaseUrl);
console.log('Key:', supabaseKey ? 'PRESENT' : 'MISSING');

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  try {
    console.log('Testing connection...');
    const { data, error } = await supabase.from('extinguishers').select('*').limit(1);
    if (error) {
      console.error('Supabase Error:', error);
    } else {
      console.log('Success! Data:', data);
    }
  } catch (err) {
    console.error('Catch Error:', err);
  }
}

test();
