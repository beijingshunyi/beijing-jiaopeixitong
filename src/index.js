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
    <title>北京青翎舞蹈艺术中心 - 管理系统</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Microsoft YaHei', 'PingFang SC', sans-serif;
            background-color: #f8f9fa;
            color: #333;
            line-height: 1.6;
            overflow-x: hidden;
        }
        
        /* 侧边栏 */
        .sidebar {
            position: fixed;
            left: 0;
            top: 0;
            width: 260px;
            height: 100vh;
            background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
            color: white;
            padding: 30px 0;
            box-shadow: 2px 0 10px rgba(0,0,0,0.1);
            z-index: 1000;
        }
        
        .sidebar-header {
            text-align: center;
            padding: 0 20px 30px;
            border-bottom: 1px solid rgba(255,255,255,0.1);
        }
        
        .sidebar-header h1 {
            font-size: 20px;
            font-weight: 600;
            margin-bottom: 8px;
            color: #ffffff;
        }
        
        .sidebar-header p {
            font-size: 14px;
            opacity: 0.8;
            color: #ecf0f1;
        }
        
        .nav-menu {
            list-style: none;
            margin-top: 30px;
        }
        
        .nav-menu li {
            margin-bottom: 5px;
        }
        
        .nav-menu a {
            display: block;
            padding: 15px 30px;
            color: rgba(255,255,255,0.8);
            text-decoration: none;
            transition: all 0.3s ease;
            font-size: 15px;
            border-left: 3px solid transparent;
        }
        
        .nav-menu a:hover {
            background-color: rgba(255,255,255,0.1);
            color: white;
            border-left-color: #3498db;
            transform: translateX(5px);
        }
        
        .nav-menu a.active {
            background-color: rgba(52,152,219,0.2);
            color: white;
            border-left-color: #3498db;
        }
        
        /* 主内容区 */
        .main-content {
            margin-left: 260px;
            min-height: 100vh;
            background-color: #f8f9fa;
        }
        
        /* 顶部导航 */
        .top-nav {
            background-color: white;
            padding: 20px 30px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.05);
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .top-nav h2 {
            font-size: 24px;
            color: #2c3e50;
            font-weight: 600;
        }
        
        .user-info {
            display: flex;
            align-items: center;
            gap: 15px;
        }
        
        .user-info span {
            color: #666;
            font-size: 14px;
        }
        
        .user-info button {
            padding: 8px 16px;
            background-color: #3498db;
            color: white;
            border: none;
            border-radius: 4px;
            font-size: 14px;
            cursor: pointer;
            transition: background-color 0.3s ease;
        }
        
        .user-info button:hover {
            background-color: #2980b9;
        }
        
        /* 内容区域 */
        .content {
            padding: 30px;
        }
        
        /* 仪表盘 */
        .dashboard {
            margin-bottom: 30px;
        }
        
        .dashboard h3 {
            font-size: 18px;
            color: #2c3e50;
            margin-bottom: 20px;
            font-weight: 600;
        }
        
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
            gap: 20px;
        }
        
        .stat-card {
            background: white;
            padding: 30px;
            border-radius: 12px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.05);
            transition: all 0.3s ease;
            border-top: 4px solid #3498db;
        }
        
        .stat-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 8px 25px rgba(0,0,0,0.1);
        }
        
        .stat-card h4 {
            font-size: 14px;
            color: #7f8c8d;
            margin-bottom: 15px;
            font-weight: 500;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .stat-card p {
            font-size: 32px;
            font-weight: 700;
            color: #2c3e50;
        }
        
        .stat-card.dance {
            border-top-color: #e74c3c;
        }
        
        .stat-card.course {
            border-top-color: #2ecc71;
        }
        
        .stat-card.attendance {
            border-top-color: #f39c12;
        }
        
        .stat-card.revenue {
            border-top-color: #9b59b6;
        }
        
        /* API部分 */
        .api-section {
            background: white;
            padding: 30px;
            border-radius: 12px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.05);
            margin-bottom: 30px;
        }
        
        .api-section h3 {
            font-size: 18px;
            color: #2c3e50;
            margin-bottom: 20px;
            font-weight: 600;
        }
        
        .api-info {
            background-color: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #3498db;
            margin-bottom: 25px;
        }
        
        .api-info h4 {
            font-size: 16px;
            color: #2c3e50;
            margin-bottom: 10px;
        }
        
        .api-info p {
            font-size: 14px;
            color: #6c757d;
            margin-bottom: 8px;
        }
        
        .api-endpoints {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 15px;
        }
        
        .endpoint-card {
            background-color: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            border-left: 3px solid #3498db;
            transition: all 0.3s ease;
        }
        
        .endpoint-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 10px rgba(0,0,0,0.05);
        }
        
        .endpoint-card h5 {
            font-size: 14px;
            color: #2c3e50;
            margin-bottom: 8px;
            font-weight: 600;
        }
        
        .endpoint-card p {
            font-size: 13px;
            color: #6c757d;
        }
        
        /* 版权信息 */
        .copyright {
            background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
            color: white;
            padding: 40px 30px;
            margin-top: 40px;
        }
        
        .copyright-content {
            max-width: 1200px;
            margin: 0 auto;
        }
        
        .copyright-header {
            text-align: center;
            margin-bottom: 30px;
        }
        
        .copyright-header h3 {
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 10px;
            color: #ffffff;
        }
        
        .copyright-header p {
            font-size: 14px;
            opacity: 0.8;
            color: #ecf0f1;
        }
        
        .copyright-info {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 30px;
            margin-bottom: 30px;
        }
        
        .info-item h4 {
            font-size: 14px;
            font-weight: 600;
            margin-bottom: 15px;
            color: #3498db;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .info-item p {
            font-size: 14px;
            line-height: 1.6;
            opacity: 0.8;
            color: #ecf0f1;
        }
        
        .copyright-footer {
            text-align: center;
            padding-top: 20px;
            border-top: 1px solid rgba(255,255,255,0.1);
        }
        
        .copyright-footer p {
            font-size: 13px;
            opacity: 0.7;
            color: #bdc3c7;
        }
        
        /* 响应式设计 */
        @media (max-width: 768px) {
            .sidebar {
                width: 200px;
            }
            
            .main-content {
                margin-left: 200px;
            }
            
            .top-nav {
                padding: 15px 20px;
            }
            
            .content {
                padding: 20px;
            }
            
            .stats-grid {
                grid-template-columns: 1fr;
            }
        }
    </style>
</head>
<body>
    <!-- 侧边栏 -->
    <div class="sidebar">
        <div class="sidebar-header">
            <h1>北京青翎舞蹈艺术中心</h1>
            <p>管理系统</p>
        </div>
        <ul class="nav-menu">
            <li><a href="#" class="active">首页仪表盘</a></li>
            <li><a href="#">学员管理</a></li>
            <li><a href="#">课程管理</a></li>
            <li><a href="#">考勤管理</a></li>
            <li><a href="#">财务管理</a></li>
            <li><a href="#">统计报表</a></li>
            <li><a href="#">系统设置</a></li>
            <li><a href="#">API测试工具</a></li>
        </ul>
    </div>
    
    <!-- 主内容区 -->
    <div class="main-content">
        <!-- 顶部导航 -->
        <div class="top-nav">
            <h2>北京青翎舞蹈艺术中心</h2>
            <div class="user-info">
                <span>管理员</span>
                <button>退出登录</button>
            </div>
        </div>
        
        <!-- 内容区域 -->
        <div class="content">
            <!-- 标签页内容将通过JavaScript动态显示 -->
            
            <!-- 版权信息 -->
            <div class="copyright">
                <div class="copyright-content">
                    <div class="copyright-header">
                        <h3>北京青翎舞蹈艺术中心</h3>
                        <p>由北京青翎文化传播有限公司全资所有并运营</p>
                    </div>
                    <div class="copyright-info">
                        <div class="info-item">
                            <h4>业务范围</h4>
                            <p>专业成人舞蹈艺术教育 · 商业演出策划 · 企业年会编排</p>
                        </div>
                        <div class="info-item">
                            <h4>联系我们</h4>
                            <p>联系电话：15011258120<br>投诉举报：18363070253</p>
                        </div>
                        <div class="info-item">
                            <h4>机构地址</h4>
                            <p>北京市东城区崇文门北京商界A座8楼818</p>
                        </div>
                    </div>
                    <div class="copyright-footer">
                        <p>&copy; 2025 北京青翎文化传播有限公司 版权所有 All Rights Reserved</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
    
    <!-- 标签页内容 -->
    <div class="tab-content">
        <!-- 首页仪表盘 -->
        <div id="dashboard" class="tab-pane active">
            <div class="dashboard">
                <h3>系统概览</h3>
                <div class="stats-grid">
                    <div class="stat-card dance">
                        <h4>总学员数</h4>
                        <p>128</p>
                    </div>
                    <div class="stat-card course">
                        <h4>总课程数</h4>
                        <p>45</p>
                    </div>
                    <div class="stat-card attendance">
                        <h4>今日考勤</h4>
                        <p>89</p>
                    </div>
                    <div class="stat-card revenue">
                        <h4>总收入</h4>
                        <p>¥12,580</p>
                    </div>
                </div>
            </div>
            
            <div class="api-section">
                <h3>API接口信息</h3>
                <div class="api-info">
                    <h4>北京青翎舞蹈艺术中心管理系统API</h4>
                    <p>版本: 1.0.0</p>
                    <p>请参考以下API端点进行系统操作</p>
                </div>
                
                <div class="api-endpoints">
                    <div class="endpoint-card">
                        <h5>认证接口</h5>
                        <p>/api/auth/*</p>
                    </div>
                    <div class="endpoint-card">
                        <h5>学员接口</h5>
                        <p>/api/student/*</p>
                    </div>
                    <div class="endpoint-card">
                        <h5>教师接口</h5>
                        <p>/api/teacher/*</p>
                    </div>
                    <div class="endpoint-card">
                        <h5>教务接口</h5>
                        <p>/api/staff/*</p>
                    </div>
                    <div class="endpoint-card">
                        <h5>管理员接口</h5>
                        <p>/api/admin/*</p>
                    </div>
                    <div class="endpoint-card">
                        <h5>健康检查</h5>
                        <p>/health</p>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- 学员管理 -->
        <div id="students" class="tab-pane">
            <div class="dashboard">
                <h3>学员管理</h3>
                <div class="api-section">
                    <p>学员管理功能开发中...</p>
                    <p>即将支持：学员信息管理、报名管理、课程分配等功能</p>
                </div>
            </div>
        </div>
        
        <!-- 课程管理 -->
        <div id="courses" class="tab-pane">
            <div class="dashboard">
                <h3>课程管理</h3>
                <div class="api-section">
                    <p>课程管理功能开发中...</p>
                    <p>即将支持：课程创建、编辑、排课、课程材料管理等功能</p>
                </div>
            </div>
        </div>
        
        <!-- 考勤管理 -->
        <div id="attendance" class="tab-pane">
            <div class="dashboard">
                <h3>考勤管理</h3>
                <div class="api-section">
                    <p>考勤管理功能开发中...</p>
                    <p>即将支持：学员打卡、考勤统计、请假管理等功能</p>
                </div>
            </div>
        </div>
        
        <!-- 财务管理 -->
        <div id="finance" class="tab-pane">
            <div class="dashboard">
                <h3>财务管理</h3>
                <div class="api-section">
                    <p>财务管理功能开发中...</p>
                    <p>即将支持：收费管理、费用统计、财务报表等功能</p>
                </div>
            </div>
        </div>
        
        <!-- 统计报表 -->
        <div id="reports" class="tab-pane">
            <div class="dashboard">
                <h3>统计报表</h3>
                <div class="api-section">
                    <p>统计报表功能开发中...</p>
                    <p>即将支持：学员统计、课程统计、收入统计等功能</p>
                </div>
            </div>
        </div>
        
        <!-- 系统设置 -->
        <div id="settings" class="tab-pane">
            <div class="dashboard">
                <h3>系统设置</h3>
                <div class="api-section">
                    <p>系统设置功能开发中...</p>
                    <p>即将支持：用户管理、角色权限、系统配置等功能</p>
                </div>
            </div>
        </div>
        
        <!-- API测试工具 -->
        <div id="api-test" class="tab-pane">
            <div class="dashboard">
                <h3>API测试工具</h3>
                <div class="api-section">
                    <p>API测试工具功能开发中...</p>
                    <p>即将支持：API接口测试、请求模拟、响应查看等功能</p>
                </div>
            </div>
        </div>
    </div>
    
    <script>
        // 添加标签页样式
        const style = document.createElement('style');
        style.textContent = `
            .tab-content {
                margin-top: 30px;
            }
            
            .tab-pane {
                display: none;
            }
            
            .tab-pane.active {
                display: block;
            }
        `;
        document.head.appendChild(style);
        
        // 导航菜单切换
        const navLinks = document.querySelectorAll('.nav-menu a');
        const tabPanes = document.querySelectorAll('.tab-pane');
        
        // 导航菜单与标签页的映射
        const navToTabMap = {
            '首页仪表盘': 'dashboard',
            '学员管理': 'students',
            '课程管理': 'courses',
            '考勤管理': 'attendance',
            '财务管理': 'finance',
            '统计报表': 'reports',
            '系统设置': 'settings',
            'API测试工具': 'api-test'
        };
        
        navLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                
                // 移除所有活动状态
                navLinks.forEach(item => {
                    item.classList.remove('active');
                });
                tabPanes.forEach(pane => {
                    pane.classList.remove('active');
                });
                
                // 添加当前活动状态
                this.classList.add('active');
                
                // 显示对应的标签页
                const tabId = navToTabMap[this.textContent.trim()];
                if (tabId) {
                    const targetPane = document.getElementById(tabId);
                    if (targetPane) {
                        targetPane.classList.add('active');
                    }
                }
            });
        });
    </script>
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
