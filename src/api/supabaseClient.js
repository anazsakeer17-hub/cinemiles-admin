import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// For a web app, Supabase automatically handles session storage in the browser!
export const supabase = createClient(supabaseUrl, supabaseAnonKey)