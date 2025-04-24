require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

console.log('Environment variables loaded:');
console.log('SUPABASE_URL:', process.env.SUPABASE_URL);
console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '**exists**' : 'undefined');
console.log('DATABASE_URL:', process.env.DATABASE_URL ? '**exists**' : 'undefined');
console.log('DIRECT_URL:', process.env.DIRECT_URL ? '**exists**' : 'undefined');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  try {
    console.log('Testing Supabase connection...');
    
    // Test the connection by making a simple query
    const { data, error } = await supabase
      .from('_prisma_migrations')
      .select('*')
      .limit(1);

    if (error) throw error;
    
    console.log('✅ Successfully connected to Supabase!');
    console.log('Database connection is working.');
    
  } catch (error) {
    console.error('❌ Connection test failed:');
    console.error(error);
  }
}

testConnection(); 