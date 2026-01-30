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

// 系统设置功能

// 获取系统设置
const getSystemSettings = async (c) => {
  try {
    const { data: settings, error } = await supabaseService
      .from('system_settings')
      .select('*')
      .single();

    if (error) {
      // 如果设置不存在，返回默认设置
      return c.json({
        settings: {
          system_name: '教培管理系统',
          system_description: '专业的教育培训管理系统',
          contact_email: 'contact@example.com',
          contact_phone: '13800138000',
          logo_url: '',
          favicon_url: '',
          enable_email_notifications: true,
          enable_sms_notifications: false,
          email_template: '默认邮件模板',
          password_min_length: 8,
          password_require_uppercase: true,
          password_require_lowercase: true,
          password_require_numbers: true,
          password_require_symbols: false,
          max_login_attempts: 5,
          lockout_duration: 30,
          file_upload_limit: 10,
          allowed_file_types: 'jpg,png,pdf,doc,docx',
          cache_duration: 3600,
          maintenance_mode: false,
          maintenance_message: '系统维护中，请稍后访问',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      });
    }

    return c.json({ settings });
  } catch (error) {
    return c.json({ error: error.message }, 400);
  }
};

// 更新系统设置
const updateSystemSettings = async (c) => {
  try {
    const settingsData = await c.req.json();

    // 检查设置是否存在
    const { data: existingSettings, error: checkError } = await supabaseService
      .from('system_settings')
      .select('id')
      .single();

    let result;
    if (existingSettings) {
      // 更新现有设置
      result = await supabaseService
        .from('system_settings')
        .update({
          ...settingsData,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingSettings.id)
        .select()
        .single();
    } else {
      // 创建新设置
      result = await supabaseService
        .from('system_settings')
        .insert({
          ...settingsData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();
    }

    if (result.error) {
      throw new Error('更新系统设置失败');
    }

    return c.json({ 
      success: true, 
      message: '系统设置更新成功',
      settings: result.data 
    });
  } catch (error) {
    return c.json({ error: error.message }, 400);
  }
};

// 获取通知设置
const getNotificationSettings = async (c) => {
  try {
    const { data: settings, error } = await supabaseService
      .from('notification_settings')
      .select('*')
      .single();

    if (error) {
      // 如果设置不存在，返回默认设置
      return c.json({
        settings: {
          enable_email: true,
          enable_sms: false,
          enable_push: false,
          email_host: 'smtp.example.com',
          email_port: 587,
          email_username: 'noreply@example.com',
          email_password: '',
          email_from: 'noreply@example.com',
          sms_api_key: '',
          sms_api_secret: '',
          sms_from: '',
          notification_templates: {
            welcome: '欢迎使用教培管理系统',
            course_enrollment: '您已成功报名课程',
            payment_confirmation: '缴费成功通知',
            attendance_reminder: '考勤提醒',
            grade_release: '成绩发布通知'
          }
        }
      });
    }

    return c.json({ settings });
  } catch (error) {
    return c.json({ error: error.message }, 400);
  }
};

// 更新通知设置
const updateNotificationSettings = async (c) => {
  try {
    const settingsData = await c.req.json();

    // 检查设置是否存在
    const { data: existingSettings, error: checkError } = await supabaseService
      .from('notification_settings')
      .select('id')
      .single();

    let result;
    if (existingSettings) {
      // 更新现有设置
      result = await supabaseService
        .from('notification_settings')
        .update({
          ...settingsData,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingSettings.id)
        .select()
        .single();
    } else {
      // 创建新设置
      result = await supabaseService
        .from('notification_settings')
        .insert({
          ...settingsData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();
    }

    if (result.error) {
      throw new Error('更新通知设置失败');
    }

    return c.json({ 
      success: true, 
      message: '通知设置更新成功',
      settings: result.data 
    });
  } catch (error) {
    return c.json({ error: error.message }, 400);
  }
};

// 获取安全设置
const getSecuritySettings = async (c) => {
  try {
    const { data: settings, error } = await supabaseService
      .from('security_settings')
      .select('*')
      .single();

    if (error) {
      // 如果设置不存在，返回默认设置
      return c.json({
        settings: {
          password_min_length: 8,
          password_require_uppercase: true,
          password_require_lowercase: true,
          password_require_numbers: true,
          password_require_symbols: false,
          password_expiry_days: 90,
          max_login_attempts: 5,
          lockout_duration: 30,
          session_timeout: 3600,
          enable_2fa: false,
          allowed_ip_ranges: '',
          enable_ssl: true,
          cors_origins: '*',
          rate_limit_enabled: true,
          rate_limit_requests: 100,
          rate_limit_window: 60
        }
      });
    }

    return c.json({ settings });
  } catch (error) {
    return c.json({ error: error.message }, 400);
  }
};

// 更新安全设置
const updateSecuritySettings = async (c) => {
  try {
    const settingsData = await c.req.json();

    // 检查设置是否存在
    const { data: existingSettings, error: checkError } = await supabaseService
      .from('security_settings')
      .select('id')
      .single();

    let result;
    if (existingSettings) {
      // 更新现有设置
      result = await supabaseService
        .from('security_settings')
        .update({
          ...settingsData,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingSettings.id)
        .select()
        .single();
    } else {
      // 创建新设置
      result = await supabaseService
        .from('security_settings')
        .insert({
          ...settingsData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();
    }

    if (result.error) {
      throw new Error('更新安全设置失败');
    }

    // 记录系统日志
    await logSystemEvent(c, 'security_settings_updated', `安全设置已更新`, { 
      changes: Object.keys(settingsData) 
    });

    return c.json({ 
      success: true, 
      message: '安全设置更新成功',
      settings: result.data 
    });
  } catch (error) {
    return c.json({ error: error.message }, 400);
  }
};

// 系统日志和审计功能

// 记录系统事件
const logSystemEvent = async (c, eventType, description, metadata = {}) => {
  try {
    const userId = c.get('userProfile')?.id;
    const userIp = c.req.header('x-forwarded-for') || c.req.header('remote-addr') || 'unknown';
    const userAgent = c.req.header('user-agent') || 'unknown';

    await supabaseService
      .from('system_logs')
      .insert({
        event_type: eventType,
        description: description,
        user_id: userId,
        ip_address: userIp,
        user_agent: userAgent,
        metadata: metadata,
        created_at: new Date().toISOString()
      });
  } catch (error) {
    console.error('记录系统日志失败:', error);
  }
};

// 获取系统日志
const getSystemLogs = async (c) => {
  try {
    const { eventType, userId, startDate, endDate, page = 1, limit = 20 } = c.req.query();

    let query = supabaseService
      .from('system_logs')
      .select(`
        id,
        event_type,
        description,
        user_id,
        ip_address,
        user_agent,
        metadata,
        created_at,
        user_profiles(name, email) as user
      `, { count: 'exact' });

    if (eventType) {
      query = query.eq('event_type', eventType);
    }

    if (userId) {
      query = query.eq('user_id', userId);
    }

    if (startDate) {
      query = query.gte('created_at', startDate);
    }

    if (endDate) {
      query = query.lte('created_at', endDate);
    }

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data: logs, error, count } = await query
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) {
      throw new Error('获取系统日志失败');
    }

    return c.json({
      logs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    return c.json({ error: error.message }, 400);
  }
};

// 获取审计日志
const getAuditLogs = async (c) => {
  try {
    const { actionType, resourceType, userId, startDate, endDate, page = 1, limit = 20 } = c.req.query();

    let query = supabaseService
      .from('audit_logs')
      .select(`
        id,
        action_type,
        resource_type,
        resource_id,
        user_id,
        ip_address,
        user_agent,
        before_data,
        after_data,
        created_at,
        user_profiles(name, email) as user
      `, { count: 'exact' });

    if (actionType) {
      query = query.eq('action_type', actionType);
    }

    if (resourceType) {
      query = query.eq('resource_type', resourceType);
    }

    if (userId) {
      query = query.eq('user_id', userId);
    }

    if (startDate) {
      query = query.gte('created_at', startDate);
    }

    if (endDate) {
      query = query.lte('created_at', endDate);
    }

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data: logs, error, count } = await query
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) {
      throw new Error('获取审计日志失败');
    }

    return c.json({
      logs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    return c.json({ error: error.message }, 400);
  }
};

// 清理系统日志
const cleanupSystemLogs = async (c) => {
  try {
    const { daysToKeep = 30 } = await c.req.json();

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const { error } = await supabaseService
      .from('system_logs')
      .delete()
      .lt('created_at', cutoffDate.toISOString());

    if (error) {
      throw new Error('清理系统日志失败');
    }

    return c.json({ 
      success: true, 
      message: `成功清理 ${daysToKeep} 天前的系统日志` 
    });
  } catch (error) {
    return c.json({ error: error.message }, 400);
  }
};

// 获取系统活动统计
const getSystemActivityStats = async (c) => {
  try {
    const { startDate, endDate } = c.req.query();

    let query = supabaseService
      .from('system_logs')
      .select('event_type, COUNT(*) as count')
      .group('event_type');

    if (startDate) {
      query = query.gte('created_at', startDate);
    }

    if (endDate) {
      query = query.lte('created_at', endDate);
    }

    const { data: stats, error } = await query;

    if (error) {
      throw new Error('获取系统活动统计失败');
    }

    const activityStats = {};
    stats.forEach(stat => {
      activityStats[stat.event_type] = stat.count;
    });

    return c.json({ stats: activityStats });
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
  getSystemStats,
  
  // 系统设置
  getSystemSettings,
  updateSystemSettings,
  getNotificationSettings,
  updateNotificationSettings,
  getSecuritySettings,
  updateSecuritySettings,
  
  // 系统日志和审计
  getSystemLogs,
  getAuditLogs,
  cleanupSystemLogs,
  getSystemActivityStats
};
