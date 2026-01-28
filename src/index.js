import { Hono } from 'hono';
import { cors } from 'hono/cors';
import routes from './routes/index.js';

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

// 注册路由
try {
  console.log('Registering routes...');
  console.log('Routes object:', routes);
  app.route('/api', routes);
  console.log('Routes registered successfully');
  // 测试直接注册一个路由
  app.post('/test/login', (c) => {
    return c.json({ test: 'login route works' });
  });
  console.log('Test route added');
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
