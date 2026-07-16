import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn('Supabase 环境变量未配置，将使用本地 Mock 数据');
}

export const supabase = createClient(
  supabaseUrl || 'http://localhost',
  supabaseKey || 'fallback'
);
