import { createClient } from '@supabase/supabase-js'

const url = (import.meta.env.VITE_SUPABASE_URL as string) || 'https://njkslucischlvjlflzrr.supabase.co'
const anonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string) || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5qa3NsdWNpc2NobHZqbGZsenJyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE3ODA1MTgsImV4cCI6MjA5NzM1NjUxOH0.ztfcHSBVWStF3mDB106eRbWDtecptgyFrP62oWtMybU'

export const supabase = createClient(url, anonKey, {
  auth: { persistSession: true, autoRefreshToken: true },
})
