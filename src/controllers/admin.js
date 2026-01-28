import { supabaseService } from '../services/supabase.js';
import authService from '../services/auth.js';

// 用户管理

// 获取所有用户
const getAllUsers = async (c) => {
  try {
    const { roleId, collegeId } = c.req.query();

    let query = supabaseService
      .from('user_profiles')
      .select(`
        id,
        name,
        email,
        phone,
        student_id as student_number,
        teacher_id as teacher_number,
        roles(name) as role,
        colleges(name) as college,
        majors(name) as major,
        classes(name) as class,
        created_at
      `);

    if (roleId) {
      query = query.eq('role_id', roleId);
    }

    if (collegeId) {
      query = query.eq('college_id', collegeId);
    }

    const { data: users, error } = await query;

    if (error) {
      throw new Error('获取用户列表失败');
    }

    return c.json({ users });
  } catch (error) {
    return c.json({ error: error.message }, 400);
  }
};

// 创建用户
const createUser = async (c) => {
  try {
    const userData = await c.req.json();
    
    // 使用认证服务注册用户
    const result = await authService.register(userData);
    
    return c.json({ user: result.user, token: result.token }, 201);
  } catch (error) {
    return c.json({ error: error.message }, 400);
  }
};

// 更新用户
const updateUser = async (c) => {
  try {
    const { id } = c.req.param();
    const updateData = await c.req.json();

    // 更新用户档案
    const { data: updatedUser, error } = await supabaseService
      .from('user_profiles')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error('更新用户失败');
    }

    return c.json({ user: updatedUser });
  } catch (error) {
    return c.json({ error: error.message }, 400);
  }
};

// 删除用户
const deleteUser = async (c) => {
  try {
    const { id } = c.req.param();

    // 1. 删除用户档案
    const { error: profileError } = await supabaseService
      .from('user_profiles')
      .delete()
      .eq('id', id);

    if (profileError) {
      throw new Error('删除用户档案失败');
    }

    // 2. 删除Supabase Auth用户
    const { error: authError } = await supabaseService.auth.admin.deleteUser(id);

    if (authError) {
      throw new Error('删除认证用户失败');
    }

    return c.json({ success: true, message: '用户删除成功' });
  } catch (error) {
    return c.json({ error: error.message }, 400);
  }
};

// 重置用户密码
const resetPassword = async (c) => {
  try {
    const { id, newPassword } = await c.req.json();

    const { error } = await supabaseService.auth.admin.updateUserById(id, {
      password: newPassword
    });

    if (error) {
      throw new Error('重置密码失败');
    }

    return c.json({ success: true, message: '密码重置成功' });
  } catch (error) {
    return c.json({ error: error.message }, 400);
  }
};

// 角色管理

// 获取所有角色
const getAllRoles = async (c) => {
  try {
    const { data: roles, error } = await supabaseService
      .from('roles')
      .select('*');

    if (error) {
      throw new Error('获取角色列表失败');
    }

    return c.json({ roles });
  } catch (error) {
    return c.json({ error: error.message }, 400);
  }
};

// 创建角色
const createRole = async (c) => {
  try {
    const { name, description } = await c.req.json();

    const { data: role, error } = await supabaseService
      .from('roles')
      .insert({ name, description })
      .select()
      .single();

    if (error) {
      throw new Error('创建角色失败');
    }

    return c.json({ role }, 201);
  } catch (error) {
    return c.json({ error: error.message }, 400);
  }
};

// 更新角色
const updateRole = async (c) => {
  try {
    const { id } = c.req.param();
    const { name, description } = await c.req.json();

    const { data: role, error } = await supabaseService
      .from('roles')
      .update({ name, description })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error('更新角色失败');
    }

    return c.json({ role });
  } catch (error) {
    return c.json({ error: error.message }, 400);
  }
};

// 删除角色
const deleteRole = async (c) => {
  try {
    const { id } = c.req.param();

    // 检查是否有用户使用该角色
    const { data: users, error: userError } = await supabaseService
      .from('user_profiles')
      .select('id')
      .eq('role_id', id);

    if (userError) {
      throw new Error('检查角色使用情况失败');
    }

    if (users.length > 0) {
      throw new Error('该角色正在被使用，无法删除');
    }

    const { error } = await supabaseService
      .from('roles')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error('删除角色失败');
    }

    return c.json({ success: true, message: '角色删除成功' });
  } catch (error) {
    return c.json({ error: error.message }, 400);
  }
};

// 权限管理（用户角色分配）

// 获取用户角色分配
const getUserRoles = async (c) => {
  try {
    const { userId } = c.req.param();

    const { data: userRoles, error } = await supabaseService
      .from('user_roles')
      .select(`
        role_id,
        roles(name, description)
      `)
      .eq('user_id', userId);

    if (error) {
      throw new Error('获取用户角色失败');
    }

    return c.json({ 
      roles: userRoles.map(item => ({
        id: item.role_id,
        name: item.roles.name,
        description: item.roles.description
      })) 
    });
  } catch (error) {
    return c.json({ error: error.message }, 400);
  }
};

// 分配角色给用户
const assignRole = async (c) => {
  try {
    const { userId, roleId } = await c.req.json();

    // 检查用户是否存在
    const { data: user, error: userError } = await supabaseService
      .from('user_profiles')
      .select('id')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      throw new Error('用户不存在');
    }

    // 检查角色是否存在
    const { data: role, error: roleError } = await supabaseService
      .from('roles')
      .select('id')
      .eq('id', roleId)
      .single();

    if (roleError || !role) {
      throw new Error('角色不存在');
    }

    // 检查是否已分配
    const { data: existing, error: existingError } = await supabaseService
      .from('user_roles')
      .select('id')
      .eq('user_id', userId)
      .eq('role_id', roleId)
      .single();

    if (existing) {
      throw new Error('角色已分配');
    }

    // 分配角色
    const { data: assignment, error } = await supabaseService
      .from('user_roles')
      .insert({ user_id: userId, role_id: roleId })
      .select()
      .single();

    if (error) {
      throw new Error('分配角色失败');
    }

    return c.json({ success: true, assignment });
  } catch (error) {
    return c.json({ error: error.message }, 400);
  }
};

// 从用户移除角色
const removeRole = async (c) => {
  try {
    const { userId, roleId } = await c.req.json();

    const { error } = await supabaseService
      .from('user_roles')
      .delete()
      .eq('user_id', userId)
      .eq('role_id', roleId);

    if (error) {
      throw new Error('移除角色失败');
    }

    return c.json({ success: true, message: '角色移除成功' });
  } catch (error) {
    return c.json({ error: error.message }, 400);
  }
};

// 系统统计

// 获取系统统计数据
const getSystemStats = async (c) => {
  try {
    // 获取用户统计
    const { data: userStats, error: userError } = await supabaseService
      .from('user_profiles')
      .select('role_id, COUNT(*) as count')
      .group('role_id');

    // 获取课程统计
    const { data: courseStats, error: courseError } = await supabaseService
      .from('courses')
      .select('status, COUNT(*) as count')
      .group('status');

    // 获取学院统计
    const { data: collegeCount, error: collegeError } = await supabaseService
      .from('colleges')
      .select('id')
      .count();

    // 获取专业统计
    const { data: majorCount, error: majorError } = await supabaseService
      .from('majors')
      .select('id')
      .count();

    // 获取班级统计
    const { data: classCount, error: classError } = await supabaseService
      .from('classes')
      .select('id')
      .count();

    if (userError || courseError || collegeError || majorError || classError) {
      throw new Error('获取统计数据失败');
    }

    // 格式化统计数据
    const userRoleStats = {};
    userStats.forEach(stat => {
      userRoleStats[stat.role_id] = stat.count;
    });

    const courseStatusStats = {};
    courseStats.forEach(stat => {
      courseStatusStats[stat.status] = stat.count;
    });

    return c.json({
      users: {
        total: Object.values(userRoleStats).reduce((sum, count) => sum + count, 0),
        byRole: userRoleStats
      },
      courses: {
        total: Object.values(courseStatusStats).reduce((sum, count) => sum + count, 0),
        byStatus: courseStatusStats
      },
      colleges: collegeCount,
      majors: majorCount,
      classes: classCount
    });
  } catch (error) {
    return c.json({ error: error.message }, 400);
  }
};

export default {
  // 用户管理
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  resetPassword,
  
  // 角色管理
  getAllRoles,
  createRole,
  updateRole,
  deleteRole,
  
  // 权限管理
  getUserRoles,
  assignRole,
  removeRole,
  
  // 系统统计
  getSystemStats
};
