import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

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