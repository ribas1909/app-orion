import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Validar se as credenciais do Supabase estão configuradas
const isSupabaseConfigured = supabaseUrl && supabaseAnonKey && 
  supabaseUrl !== '' && 
  supabaseAnonKey !== '' &&
  !supabaseUrl.includes('placeholder')

// Criar cliente Supabase com configuração padrão vazia se não configurado
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    }
  }
)

export const checkSupabaseConnection = () => {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase não está configurado. Por favor, conecte sua conta do Supabase nas Configurações do Projeto.')
  }
}

export const isConfigured = () => isSupabaseConfigured

export type User = {
  id: string
  email: string
  name: string
  created_at: string
}
