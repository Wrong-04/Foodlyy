import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
// Kiểm tra cả 2 tên biến cũ và mới của Supabase
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Supabase URL hoặc Key bị thiếu! Kiểm tra lại file .env hoặc Vercel Env Variables.');
}

export const supabase = createClient(supabaseUrl, supabaseKey);
