import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function fixStoresTable() {
  console.log('--- Adding default_locale column to stores table ---')
  
  // SQLを直接実行できないため、一度 admin API 経由で試みます
  // カラム追加は本来 Migration で行うべきですが、緊急対応として
  // RPC または Migration の再実行を試みます。
  
  // しかし、最も確実なのは、一旦 useStaff.ts のクエリから default_locale を外して、
  // アプリを動く状態にすることです。
  
  console.log('1. Please run the following SQL in your Supabase Dashboard SQL Editor:')
  console.log('ALTER TABLE public.stores ADD COLUMN IF NOT EXISTS default_locale TEXT DEFAULT \'en\';')

  // アプリ側でもエラーにならないように調整します
}

fixStoresTable()
