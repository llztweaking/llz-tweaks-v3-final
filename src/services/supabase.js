import {createClient} from '@supabase/supabase-js'
const u=import.meta.env.VITE_SUPABASE_URL,k=import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
export const supabase=u&&k?createClient(u,k):null
