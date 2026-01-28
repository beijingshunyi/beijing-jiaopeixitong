import { Hono } from 'hono';
import { cors } from 'hono/cors';
import routes from './routes';

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
app.route('/api', routes);

// 404 处理
app.notFound((c) => {
  return c.json({ error: '接口不存在' }, 404);
});

// 错误处理中间件
app.onError((err, c) => {
  console.error('服务器错误:', err);
  return c.json({ error: '服务器内部错误' }, 500);
});

// 导出应用
export default app;
