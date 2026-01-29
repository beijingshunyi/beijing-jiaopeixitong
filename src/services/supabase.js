import { createClient } from '@supabase/supabase-js';

// 从环境变量获取配置（延迟获取，在实际使用时才会报错）
const getSupabaseUrl = () => {
  const url = process.env.SUPABASE_URL;
  if (!url) {
    console.error('SUPABASE_URL is not set');
  }
  return url || 'https://placeholder.supabase.co';
};

const getSupabaseAnonKey = () => {
  const key = process.env.SUPABASE_ANON_KEY;
  if (!key) {
    console.error('SUPABASE_ANON_KEY is not set');
  }
  return key || 'placeholder-key';
};

const getSupabaseServiceKey = () => {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) {
    console.error('SUPABASE_SERVICE_ROLE_KEY is not set');
  }
  return key || 'placeholder-key';
};

// 用于客户端请求的匿名客户端
const supabaseAnon = createClient(getSupabaseUrl(), getSupabaseAnonKey());

// 用于服务端操作的服务角色客户端（拥有所有权限）
const supabaseService = createClient(getSupabaseUrl(), getSupabaseServiceKey());

export { supabaseAnon, supabaseService };
