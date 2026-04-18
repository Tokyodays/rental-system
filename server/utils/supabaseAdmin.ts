import { createClient } from '@supabase/supabase-js'

export const useSupabaseAdmin = () => {
  const config = useRuntimeConfig()
  
  // サービスロールキーが必要
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || config.supabase?.serviceRoleKey
  
  if (!serviceRoleKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set')
  }

  return createClient(process.env.SUPABASE_URL!, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}
