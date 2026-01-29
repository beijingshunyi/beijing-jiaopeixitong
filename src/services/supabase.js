import { createClient } from '@supabase/supabase-js';

// 从环境变量获取配置
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// 验证必需的环境变量
if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
  throw new Error('缺少必需的Supabase环境变量。请检查SUPABASE_URL, SUPABASE_ANON_KEY, 和 SUPABASE_SERVICE_ROLE_KEY是否已配置。');
}

// 用于客户端请求的匿名客户端
const supabaseAnon = createClient(supabaseUrl, supabaseAnonKey);

// 用于服务端操作的服务角色客户端（拥有所有权限）
const supabaseService = createClient(supabaseUrl, supabaseServiceKey);

export { supabaseAnon, supabaseService };
