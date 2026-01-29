import app from '../src/index.js';

// Vercel Serverless Function handler for Hono
export default async (req, res) => {
  try {
    // 获取完整的 URL
    const protocol = req.headers['x-forwarded-proto'] || 'https';
    const host = req.headers['x-forwarded-host'] || req.headers.host || 'localhost';
    const url = new URL(req.url || '/', `${protocol}://${host}`);

    // 处理请求体
    let body = undefined;
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      if (req.body) {
        // 如果 body 已经被解析（Vercel 可能会预处理）
        body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
      } else {
        // 读取原始 body
        const chunks = [];
        for await (const chunk of req) {
          chunks.push(chunk);
        }
        body = Buffer.concat(chunks).toString();
      }
    }

    // 构建 Fetch API 兼容的 Request 对象
    const request = new Request(url.toString(), {
      method: req.method,
      headers: new Headers(req.headers),
      body: body,
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
    const responseBody = await response.text();
    res.send(responseBody);
  } catch (error) {
    console.error('Vercel handler error:', error);
    res.status(500).json({
      error: '服务器内部错误',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};
