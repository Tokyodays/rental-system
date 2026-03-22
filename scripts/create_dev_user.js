import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase URL or Key')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function createDevUser() {
  const email = 'developer@gmail.com'
  const password = 'password123'

  console.log(`Attempting to sign up user: ${email}`)
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  })

  if (error) {
    console.error('Sign up failed:', error.message)
    process.exit(1)
  }

  console.log('Successfully created development user!')
  console.log(`Email: ${email}`)
  console.log(`Password: ${password}`)
  console.log(`User ID: ${data.user?.id}`)
}

createDevUser()
