import { verify } from 'hono/jwt';
import { supabaseService } from '../services/supabase.js';

// 认证中间件
const authMiddleware = async (c, next) => {
  try {
    // 从请求头获取token
    const authHeader = c.req.header('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return c.json({ error: '未提供认证令牌' }, 401);
    }

    const token = authHeader.split(' ')[1];
    
    // 验证token
    const decoded = await verify(token, process.env.JWT_SECRET);
    c.set('user', decoded);

    // 从数据库获取用户详细信息
    const { data: userProfile, error } = await supabaseService
      .from('user_profiles')
      .select('*')
      .eq('id', decoded.sub)
      .single();

    if (error || !userProfile) {
      return c.json({ error: '用户不存在' }, 401);
    }

    c.set('userProfile', userProfile);
    await next();
  } catch (error) {
    console.error('认证错误:', error);
    return c.json({ error: '无效的认证令牌' }, 401);
  }
};

// 角色授权中间件
const roleMiddleware = (requiredRoles) => {
  return async (c, next) => {
    const userProfile = c.get('userProfile');
    if (!userProfile) {
      return c.json({ error: '请先认证' }, 401);
    }

    // 获取用户角色
    const userRoleId = userProfile.role_id;

    // 检查用户是否具有所需角色
    if (!requiredRoles.includes(userRoleId)) {
      return c.json({ error: '权限不足' }, 403);
    }

    await next();
  };
};

export { authMiddleware, roleMiddleware };
