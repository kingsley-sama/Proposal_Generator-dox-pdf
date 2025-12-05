const { createClient } = require('@supabase/supabase-js')

// Get these from your Supabase project settings
const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_KEY



const db = createClient(supabaseUrl, supabaseKey)
module.exports = db