import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { serveStatic } from 'hono/serve-static';
import authController from './controllers/auth.js';
import studentController from './controllers/student.js';
import teacherController from './controllers/teacher.js';
import staffController from './controllers/staff.js';
import adminController from './controllers/admin.js';
import { authMiddleware, roleMiddleware } from './middleware/auth.js';

// 添加环境变量检查
console.log('Environment variables loaded:', {
  SUPABASE_URL: process.env.SUPABASE_URL ? '✓' : '✗',
  SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY ? '✓' : '✗',
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? '✓' : '✗',
  JWT_SECRET: process.env.JWT_SECRET ? '✓' : '✗'
});

const app = new Hono();

// 中间件配置
app.use('*', cors());

// 健康检查
app.get('/health', (c) => {
  return c.json({ status: 'ok', message: '服务运行正常' });
});

// 角色ID映射
const ROLES = {
  ADMIN: 1,
  STAFF: 2,
  TEACHER: 3,
  STUDENT: 4
};

// 注册路由
try {
    console.log('Registering routes...');
    
    // 为 /api/ 路径添加路由处理
    app.get('/api/', (c) => {
      return c.json({
        message: '教培系统后端API',
        version: '1.0.0',
        endpoints: {
          auth: '/api/auth/*',
          student: '/api/student/*',
          teacher: '/api/teacher/*',
          staff: '/api/staff/*',
          admin: '/api/admin/*'
        },
        documentation: '请参考API文档使用各端点'
      });
    });
    console.log('API root route added');
    
    // 测试路由
    app.post('/test/login', (c) => {
      return c.json({ test: 'login route works' });
    });
    console.log('Test route added');
    
    // 认证路由
    console.log('Adding auth routes...');
    app.post('/api/auth/register', authController.register);
    app.post('/api/auth/login', authController.login);
    app.post('/api/auth/refresh', authController.refreshToken);
    app.post('/api/auth/logout', authController.logout);
    app.get('/api/auth/me', authMiddleware, authController.getCurrentUser);
    console.log('Auth routes added');
    
    // 学生路由
    console.log('Adding student routes...');
    app.get('/api/student/dashboard', authMiddleware, roleMiddleware([ROLES.STUDENT]), studentController.getDashboard);
    app.get('/api/student/courses/available', authMiddleware, roleMiddleware([ROLES.STUDENT]), studentController.getAvailableCourses);
    app.post('/api/student/courses/enroll', authMiddleware, roleMiddleware([ROLES.STUDENT]), studentController.enrollCourse);
    app.post('/api/student/courses/drop', authMiddleware, roleMiddleware([ROLES.STUDENT]), studentController.dropCourse);
    app.get('/api/student/courses/enrolled', authMiddleware, roleMiddleware([ROLES.STUDENT]), studentController.getEnrolledCourses);
    app.get('/api/student/grades', authMiddleware, roleMiddleware([ROLES.STUDENT]), studentController.getGrades);
    app.get('/api/student/schedule', authMiddleware, roleMiddleware([ROLES.STUDENT]), studentController.getSchedule);
    app.post('/api/student/evaluations', authMiddleware, roleMiddleware([ROLES.STUDENT]), studentController.submitEvaluation);
    app.get('/api/student/teaching-plan', authMiddleware, roleMiddleware([ROLES.STUDENT]), studentController.getTeachingPlan);
    app.get('/api/student/training-program', authMiddleware, roleMiddleware([ROLES.STUDENT]), studentController.getTrainingProgram);
    app.put('/api/student/profile', authMiddleware, roleMiddleware([ROLES.STUDENT]), studentController.updateProfile);
    app.post('/api/student/password', authMiddleware, roleMiddleware([ROLES.STUDENT]), studentController.changePassword);
    // 打卡相关路由
    app.post('/api/student/checkin', authMiddleware, roleMiddleware([ROLES.STUDENT]), studentController.checkIn);
    app.get('/api/student/attendance', authMiddleware, roleMiddleware([ROLES.STUDENT]), studentController.getAttendanceRecords);
    app.get('/api/student/remaining-hours', authMiddleware, roleMiddleware([ROLES.STUDENT]), studentController.getRemainingHours);
    console.log('Student routes added');
    
    // 教师路由
    console.log('Adding teacher routes...');
    app.get('/api/teacher/courses', authMiddleware, roleMiddleware([ROLES.TEACHER]), teacherController.getMyCourses);
    app.get('/api/teacher/courses/:courseId/students', authMiddleware, roleMiddleware([ROLES.TEACHER]), teacherController.getCourseStudents);
    app.post('/api/teacher/grades', authMiddleware, roleMiddleware([ROLES.TEACHER]), teacherController.enterGrades);
    app.get('/api/teacher/courses/:courseId/evaluations', authMiddleware, roleMiddleware([ROLES.TEACHER]), teacherController.getCourseEvaluations);
    app.get('/api/teacher/schedule', authMiddleware, roleMiddleware([ROLES.TEACHER]), teacherController.getMySchedule);
    app.get('/api/teacher/courses/:courseId/statistics', authMiddleware, roleMiddleware([ROLES.TEACHER]), teacherController.getGradeStatistics);
    app.put('/api/teacher/profile', authMiddleware, roleMiddleware([ROLES.TEACHER]), teacherController.updateProfile);
    app.post('/api/teacher/courses/apply', authMiddleware, roleMiddleware([ROLES.TEACHER]), teacherController.applyForCourse);
    app.get('/api/teacher/applications', authMiddleware, roleMiddleware([ROLES.TEACHER]), teacherController.getMyApplications);
    console.log('Teacher routes added');
    
    // Staff路由
    console.log('Adding staff routes...');
    // 学院管理
    app.get('/api/staff/colleges', authMiddleware, roleMiddleware([ROLES.STAFF]), staffController.getColleges);
    app.post('/api/staff/colleges', authMiddleware, roleMiddleware([ROLES.STAFF]), staffController.createCollege);
    app.put('/api/staff/colleges/:id', authMiddleware, roleMiddleware([ROLES.STAFF]), staffController.updateCollege);
    app.delete('/api/staff/colleges/:id', authMiddleware, roleMiddleware([ROLES.STAFF]), staffController.deleteCollege);
    // 专业管理
    app.get('/api/staff/majors', authMiddleware, roleMiddleware([ROLES.STAFF]), staffController.getMajors);
    app.post('/api/staff/majors', authMiddleware, roleMiddleware([ROLES.STAFF]), staffController.createMajor);
    app.put('/api/staff/majors/:id', authMiddleware, roleMiddleware([ROLES.STAFF]), staffController.updateMajor);
    app.delete('/api/staff/majors/:id', authMiddleware, roleMiddleware([ROLES.STAFF]), staffController.deleteMajor);
    // 班级管理
    app.get('/api/staff/classes', authMiddleware, roleMiddleware([ROLES.STAFF]), staffController.getClasses);
    app.post('/api/staff/classes', authMiddleware, roleMiddleware([ROLES.STAFF]), staffController.createClass);
    app.put('/api/staff/classes/:id', authMiddleware, roleMiddleware([ROLES.STAFF]), staffController.updateClass);
    app.delete('/api/staff/classes/:id', authMiddleware, roleMiddleware([ROLES.STAFF]), staffController.deleteClass);
    // 教学计划管理
    app.get('/api/staff/teaching-plans', authMiddleware, roleMiddleware([ROLES.STAFF]), staffController.getTeachingPlans);
    app.post('/api/staff/teaching-plans', authMiddleware, roleMiddleware([ROLES.STAFF]), staffController.createTeachingPlan);
    app.delete('/api/staff/teaching-plans/:id', authMiddleware, roleMiddleware([ROLES.STAFF]), staffController.deleteTeachingPlan);
    // 培养方案管理
    app.get('/api/staff/training-programs', authMiddleware, roleMiddleware([ROLES.STAFF]), staffController.getTrainingPrograms);
    app.post('/api/staff/training-programs', authMiddleware, roleMiddleware([ROLES.STAFF]), staffController.createTrainingProgram);
    app.put('/api/staff/training-programs/:id', authMiddleware, roleMiddleware([ROLES.STAFF]), staffController.updateTrainingProgram);
    app.delete('/api/staff/training-programs/:id', authMiddleware, roleMiddleware([ROLES.STAFF]), staffController.deleteTrainingProgram);
    // 申请管理
    app.get('/api/staff/applications', authMiddleware, roleMiddleware([ROLES.STAFF]), staffController.getApplications);
    app.put('/api/staff/applications/:id', authMiddleware, roleMiddleware([ROLES.STAFF]), staffController.processApplication);
    // 学生管理
    app.get('/api/staff/students', authMiddleware, roleMiddleware([ROLES.STAFF]), staffController.getStudents);
    // 评价管理
    app.get('/api/staff/evaluations', authMiddleware, roleMiddleware([ROLES.STAFF]), staffController.getEvaluations);
    console.log('Staff routes added');
    
    // Admin路由
    console.log('Adding admin routes...');
    // 用户管理
    app.get('/api/admin/users', authMiddleware, roleMiddleware([ROLES.ADMIN]), adminController.getAllUsers);
    app.post('/api/admin/users', authMiddleware, roleMiddleware([ROLES.ADMIN]), adminController.createUser);
    app.put('/api/admin/users/:id', authMiddleware, roleMiddleware([ROLES.ADMIN]), adminController.updateUser);
    app.delete('/api/admin/users/:id', authMiddleware, roleMiddleware([ROLES.ADMIN]), adminController.deleteUser);
    app.post('/api/admin/users/reset-password', authMiddleware, roleMiddleware([ROLES.ADMIN]), adminController.resetPassword);
    // 角色管理
    app.get('/api/admin/roles', authMiddleware, roleMiddleware([ROLES.ADMIN]), adminController.getAllRoles);
    app.post('/api/admin/roles', authMiddleware, roleMiddleware([ROLES.ADMIN]), adminController.createRole);
    app.put('/api/admin/roles/:id', authMiddleware, roleMiddleware([ROLES.ADMIN]), adminController.updateRole);
    app.delete('/api/admin/roles/:id', authMiddleware, roleMiddleware([ROLES.ADMIN]), adminController.deleteRole);
    // 权限管理
    app.get('/api/admin/users/:userId/roles', authMiddleware, roleMiddleware([ROLES.ADMIN]), adminController.getUserRoles);
    app.post('/api/admin/users/roles', authMiddleware, roleMiddleware([ROLES.ADMIN]), adminController.assignRole);
    app.delete('/api/admin/users/roles', authMiddleware, roleMiddleware([ROLES.ADMIN]), adminController.removeRole);
    // 系统统计
    app.get('/api/admin/stats', authMiddleware, roleMiddleware([ROLES.ADMIN]), adminController.getSystemStats);
    console.log('Admin routes added');
    
    console.log('All API routes registered successfully');
    
    // 静态文件服务
    console.log('Adding static file serving...');
    app.use('/static', serveStatic({
      root: './public'
    }));
    console.log('Static file serving added');
    
    // 后台管理面板 - 根路径
    console.log('Adding admin panel...');
    app.get('/', (c) => {
      return c.html(
        `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>教培系统后台管理面板</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Arial', sans-serif;
            background-color: #f5f5f5;
            color: #333;
            line-height: 1.6;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
        }
        
        .header {
            background-color: #2c3e50;
            color: white;
            padding: 30px;
            border-radius: 10px;
            margin-bottom: 30px;
            text-align: center;
        }
        
        .header h1 {
            font-size: 32px;
            margin-bottom: 10px;
        }
        
        .header p {
            font-size: 18px;
            opacity: 0.9;
        }
        
        .content {
            background-color: white;
            padding: 40px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        
        .dashboard-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-bottom: 40px;
        }
        
        .dashboard-card {
            background-color: #f8f9fa;
            padding: 30px;
            border-radius: 10px;
            text-align: center;
            transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        
        .dashboard-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 5px 20px rgba(0,0,0,0.1);
        }
        
        .dashboard-card h3 {
            color: #7f8c8d;
            margin-bottom: 20px;
            font-size: 16px;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        
        .dashboard-card p {
            font-size: 36px;
            font-weight: bold;
            color: #2c3e50;
        }
        
        .dashboard-card.primary {
            background-color: #3498db;
            color: white;
        }
        
        .dashboard-card.primary h3 {
            color: rgba(255,255,255,0.9);
        }
        
        .dashboard-card.primary p {
            color: white;
        }
        
        .dashboard-card.success {
            background-color: #2ecc71;
            color: white;
        }
        
        .dashboard-card.success h3 {
            color: rgba(255,255,255,0.9);
        }
        
        .dashboard-card.success p {
            color: white;
        }
        
        .dashboard-card.warning {
            background-color: #f39c12;
            color: white;
        }
        
        .dashboard-card.warning h3 {
            color: rgba(255,255,255,0.9);
        }
        
        .dashboard-card.warning p {
            color: white;
        }
        
        .api-section {
            margin-top: 40px;
            padding-top: 40px;
            border-top: 1px solid #e9ecef;
        }
        
        .api-section h2 {
            color: #2c3e50;
            margin-bottom: 20px;
            font-size: 24px;
        }
        
        .api-info {
            background-color: #f8f9fa;
            padding: 20px;
            border-radius: 10px;
            border-left: 4px solid #3498db;
            margin-bottom: 20px;
        }
        
        .api-info h3 {
            color: #2c3e50;
            margin-bottom: 10px;
            font-size: 18px;
        }
        
        .api-info p {
            color: #6c757d;
            margin-bottom: 10px;
        }
        
        .api-endpoints {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 15px;
            margin-top: 20px;
        }
        
        .endpoint-card {
            background-color: #e8f4f8;
            padding: 15px;
            border-radius: 8px;
            border-left: 3px solid #3498db;
        }
        
        .endpoint-card h4 {
            color: #2c3e50;
            margin-bottom: 5px;
            font-size: 14px;
        }
        
        .endpoint-card p {
            color: #6c757d;
            font-size: 13px;
        }
        
        .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e9ecef;
            text-align: center;
            color: #6c757d;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>教培系统后台管理面板</h1>
            <p>欢迎使用教培系统管理平台</p>
        </div>
        
        <div class="content">
            <h2>系统概览</h2>
            <div class="dashboard-grid">
                <div class="dashboard-card primary">
                    <h3>总用户数</h3>
                    <p>128</p>
                </div>
                <div class="dashboard-card success">
                    <h3>总课程数</h3>
                    <p>45</p>
                </div>
                <div class="dashboard-card warning">
                    <h3>今日考勤</h3>
                    <p>89</p>
                </div>
                <div class="dashboard-card">
                    <h3>总收入</h3>
                    <p>¥12,580</p>
                </div>
            </div>
            
            <div class="api-section">
                <h2>API接口信息</h2>
                <div class="api-info">
                    <h3>教培系统后端API</h3>
                    <p>版本: 1.0.0</p>
                    <p>请参考以下API端点进行系统操作</p>
                </div>
                
                <div class="api-endpoints">
                    <div class="endpoint-card">
                        <h4>认证接口</h4>
                        <p>/api/auth/*</p>
                    </div>
                    <div class="endpoint-card">
                        <h4>学生接口</h4>
                        <p>/api/student/*</p>
                    </div>
                    <div class="endpoint-card">
                        <h4>教师接口</h4>
                        <p>/api/teacher/*</p>
                    </div>
                    <div class="endpoint-card">
                        <h4>教务接口</h4>
                        <p>/api/staff/*</p>
                    </div>
                    <div class="endpoint-card">
                        <h4>管理员接口</h4>
                        <p>/api/admin/*</p>
                    </div>
                    <div class="endpoint-card">
                        <h4>健康检查</h4>
                        <p>/health</p>
                    </div>
                </div>
            </div>
            
            <div class="footer">
                <p>&copy; 2024 教培系统管理平台 | 技术支持：系统开发团队</p>
            </div>
        </div>
    </div>
</body>
</html>`
      );
    });
    console.log('Admin panel added');

} catch (error) {
  console.error('Error registering routes:', error);
  // 即使路由注册失败，也要确保服务能够启动
}

// 404 处理
app.notFound((c) => {
  return c.json({ error: '接口不存在' }, 404);
});

// 错误处理中间件
app.onError((err, c) => {
  console.error('Server error:', err);
  return c.json({ error: '服务器内部错误', details: process.env.NODE_ENV === 'development' ? err.message : undefined }, 500);
});

// 导出应用
export default app;
