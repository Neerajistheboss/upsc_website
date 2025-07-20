import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Debug logging for environment variables
console.log('Environment check:')
console.log('VITE_SUPABASE_URL:', supabaseUrl ? 'Set' : 'Missing')
console.log('VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? 'Set' : 'Missing')

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables')
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Types for our PYQ data
export interface PYQData {
  id?: number
  year: number
  title: string
  paper: string
  status: string
  question_paper_url: string
  answer_key_url: string
  created_at?: string
  updated_at?: string
}

// Database table name
export const PYQ_TABLE = 'pyq_data' 