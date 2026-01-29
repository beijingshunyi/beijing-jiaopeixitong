import { handle } from '@hono/node-server/vercel';
import { Hono } from 'hono';

const app = new Hono();

app.get('/test', (c) => {
  return c.json({ message: 'Test endpoint works!' });
});

app.get('/health', (c) => {
  return c.json({ status: 'ok', message: '服务运行正常' });
});

export default handle(app);
