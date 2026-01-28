import authService from '../services/auth.js';

// 用户注册
const register = async (c) => {
  try {
    const userData = await c.req.json();
    const result = await authService.register(userData);
    return c.json(result, 201);
  } catch (error) {
    return c.json({ error: error.message }, 400);
  }
};

// 用户登录
const login = async (c) => {
  try {
    const { email, password } = await c.req.json();
    const result = await authService.login(email, password);
    return c.json(result);
  } catch (error) {
    return c.json({ error: error.message }, 401);
  }
};

// 刷新令牌
const refreshToken = async (c) => {
  try {
    const { refresh_token } = await c.req.json();
    const result = await authService.refreshToken(refresh_token);
    return c.json(result);
  } catch (error) {
    return c.json({ error: error.message }, 401);
  }
};

// 登出
const logout = async (c) => {
  try {
    const { refresh_token } = await c.req.json();
    const result = await authService.logout(refresh_token);
    return c.json(result);
  } catch (error) {
    return c.json({ error: error.message }, 400);
  }
};

// 获取当前用户信息
const getCurrentUser = async (c) => {
  try {
    const userProfile = c.get('userProfile');
    return c.json({ user: userProfile });
  } catch (error) {
    return c.json({ error: error.message }, 400);
  }
};

export default {
  register,
  login,
  refreshToken,
  logout,
  getCurrentUser
};
