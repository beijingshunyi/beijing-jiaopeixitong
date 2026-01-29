import app from '../src/index.js';

// Vercel Serverless Function handler for Hono
export default async (req, res) => {
  // 构建 Fetch API 兼容的 Request 对象
  const url = new URL(req.url || '/', `https://${req.headers.host || 'localhost'}`);

  const request = new Request(url, {
    method: req.method,
    headers: req.headers,
    body: req.method !== 'GET' && req.method !== 'HEAD' ? req.body : undefined,
  });

  // 使用 Hono 的 fetch 方法处理请求
  const response = await app.fetch(request);

  // 设置响应头
  response.headers.forEach((value, key) => {
    res.setHeader(key, value);
  });

  // 设置状态码
  res.status(response.status);

  // 发送响应体
  const body = await response.text();
  res.send(body);
};
