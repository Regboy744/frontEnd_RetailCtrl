/* eslint-env-node */

import { createClient } from '@supabase/supabase-js'

import { fakerEN_US as faker } from '@faker-js/faker'

// Create a single supabase client for interacting with your database - Does work just on node using process.env
const supabase = createClient(
 process.env.VITE_SUPABASE_URL,
 process.env.SERVICE_ROLE_KEY,
)

export { supabase, faker }
