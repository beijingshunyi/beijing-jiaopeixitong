import { Hono } from 'hono';
import { cors } from 'hono/cors';
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

// 根路径
app.get('/', (c) => {
  return c.json({
    message: '教培系统后端API',
    version: '1.0.0',
    health: '/health',
    api: '/api',
    documentation: '请参考API文档使用各端点'
  });
});

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
  console.log('Student routes added');
  
  console.log('All routes registered successfully');
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
