import { sign, verify } from 'hono/jwt';
import { supabaseService } from './supabase.js';

// 生成JWT令牌
const generateToken = (userId, roleId) => {
  return sign(
    { 
      sub: userId, 
      role: roleId,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24) // 24小时过期
    },
    process.env.JWT_SECRET
  );
};

// 用户注册
const register = async (userData) => {
  try {
    // 1. 创建Supabase Auth用户
    const { data: authUser, error: authError } = await supabaseService.auth.admin.createUser({
      email: userData.email,
      password: userData.password,
      email_confirm: true
    });

    if (authError) {
      throw new Error(`创建认证用户失败: ${authError.message}`);
    }

    // 2. 创建用户档案
    const { data: userProfile, error: profileError } = await supabaseService
      .from('user_profiles')
      .insert({
        id: authUser.user.id,
        name: userData.name,
        role_id: userData.role_id,
        college_id: userData.college_id,
        major_id: userData.major_id,
        class_id: userData.class_id,
        student_id: userData.student_id,
        teacher_id: userData.teacher_id,
        phone: userData.phone,
        email: userData.email
      })
      .select()
      .single();

    if (profileError) {
      // 如果创建档案失败，删除认证用户
      await supabaseService.auth.admin.deleteUser(authUser.user.id);
      throw new Error(`创建用户档案失败: ${profileError.message}`);
    }

    // 3. 生成JWT令牌
    const token = generateToken(authUser.user.id, userData.role_id);

    return {
      user: userProfile,
      token
    };
  } catch (error) {
    console.error('注册失败:', error);
    throw error;
  }
};

// 用户登录
const login = async (email, password) => {
  try {
    // 1. 使用Supabase Auth登录
    const { data: authResult, error: authError } = await supabaseService.auth.signInWithPassword({
      email,
      password
    });

    if (authError) {
      throw new Error(`登录失败: ${authError.message}`);
    }

    // 2. 获取用户档案
    const { data: userProfile, error: profileError } = await supabaseService
      .from('user_profiles')
      .select('*')
      .eq('id', authResult.user.id)
      .single();

    if (profileError || !userProfile) {
      throw new Error('获取用户信息失败');
    }

    // 3. 生成JWT令牌
    const token = generateToken(authResult.user.id, userProfile.role_id);

    return {
      user: userProfile,
      token
    };
  } catch (error) {
    console.error('登录失败:', error);
    throw error;
  }
};

// 刷新令牌
const refreshToken = async (refreshToken) => {
  try {
    // 使用Supabase Auth刷新令牌
    const { data: authResult, error: authError } = await supabaseService.auth.refreshSession({
      refresh_token: refreshToken
    });

    if (authError) {
      throw new Error(`刷新令牌失败: ${authError.message}`);
    }

    // 获取用户档案
    const { data: userProfile, error: profileError } = await supabaseService
      .from('user_profiles')
      .select('*')
      .eq('id', authResult.user.id)
      .single();

    if (profileError || !userProfile) {
      throw new Error('获取用户信息失败');
    }

    // 生成新的JWT令牌
    const token = generateToken(authResult.user.id, userProfile.role_id);

    return {
      user: userProfile,
      token,
      refresh_token: authResult.session.refresh_token
    };
  } catch (error) {
    console.error('刷新令牌失败:', error);
    throw error;
  }
};

// 登出
const logout = async (refreshToken) => {
  try {
    // 使用Supabase Auth登出
    const { error } = await supabaseService.auth.signOut({
      refresh_token: refreshToken
    });

    if (error) {
      throw new Error(`登出失败: ${error.message}`);
    }

    return { success: true };
  } catch (error) {
    console.error('登出失败:', error);
    throw error;
  }
};

export default {
  generateToken,
  register,
  login,
  refreshToken,
  logout
};
