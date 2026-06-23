const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  try {
    console.log("Checking Supabase connection...");
    // Just try to query a table, like profiles
    const { data, error } = await supabase.from('profiles').select('*').limit(1);
    
    if (error) {
      console.error("Database error:", error.message);
      process.exit(1);
    }
    console.log("Success! Database is connected.");
    console.log("Data:", data);
  } catch (err) {
    console.error("Connection failed:", err);
    process.exit(1);
  }
}

testConnection();
