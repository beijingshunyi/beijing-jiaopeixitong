import { createClient } from '@supabase/supabase-js';

// 尝试从不同来源获取环境变量
const supabaseUrl = process.env.SUPABASE_URL || 'https://efehecndsjiazcjgzjkl.supabase.co';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVmZWhlY25kc2ppYXpjamd6amtsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk1Njg1OTYsImV4cCI6MjA4NTE0NDU5Nn0.UfZ0DOGiClrdiPhddMp1daD2nLgGWOuYodDO9uzxRWA';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVmZWhlY25kc2ppYXpjamd6amtsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTU2ODU5NiwiZXhwIjoyMDg1MTQ0NTk2fQ.PDicjesrx-gnsqMazVj0pHzr4dRr01BD0Z57hwhV3oQ';

// 用于客户端请求的匿名客户端
const supabaseAnon = createClient(supabaseUrl, supabaseAnonKey);

// 用于服务端操作的服务角色客户端（拥有所有权限）
const supabaseService = createClient(supabaseUrl, supabaseServiceKey);

export { supabaseAnon, supabaseService };
