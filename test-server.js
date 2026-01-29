import { Hono } from 'hono';

const app = new Hono();

// 健康检查
app.get('/health', (c) => {
  return c.json({ status: 'ok', message: '服务运行正常' });
});

// 简单的HTML响应
app.get('/', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="zh-CN">
    <head>
      <meta charset="UTF-8">
      <title>测试页面</title>
    </head>
    <body>
      <h1>测试页面</h1>
      <p>服务器运行正常</p>
    </body>
    </html>
  `);
});

// 启动服务器
const port = process.env.PORT || 3000;
console.log(`服务器启动在 http://localhost:${port}`);
export default app;