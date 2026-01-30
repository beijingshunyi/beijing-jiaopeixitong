import http from 'node:http';
import { fileURLToPath } from 'node:url';
import { dirname, join, extname } from 'node:path';
import { readFileSync, statSync } from 'node:fs';

// 配置
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const publicDir = join(__dirname, 'public');
const port = 3000;

// 创建服务器
const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const path = url.pathname;
  
  console.log(`请求: ${path}`);
  
  // 处理根路径
  if (path === '/') {
    const indexPath = join(publicDir, 'index.html');
    try {
      const stats = statSync(indexPath);
      if (stats.isFile()) {
        console.log('返回: index.html');
        res.writeHead(200, { 'Content-Type': 'text/html' });
        const content = readFileSync(indexPath);
        res.end(content);
        return;
      }
    } catch (err) {
      console.error('读取index.html失败:', err.message);
    }
  }
  
  // 处理静态文件
  const filePath = join(publicDir, path.substring(1));
  console.log('文件路径:', filePath);
  
  try {
    const stats = statSync(filePath);
    if (stats.isFile()) {
      console.log('文件存在:', filePath);
      
      // 设置Content-Type
      const contentType = {
        '.html': 'text/html',
        '.css': 'text/css',
        '.js': 'text/javascript',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.gif': 'image/gif'
      }[extname(filePath)] || 'application/octet-stream';
      
      res.writeHead(200, { 
        'Content-Type': contentType,
        'Content-Length': stats.size
      });
      
      const content = readFileSync(filePath);
      res.end(content);
      console.log('返回文件成功，大小:', stats.size, '字节');
    } else {
      console.log('路径不是文件:', filePath);
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('文件不存在');
    }
  } catch (err) {
    console.error('文件错误:', err.message);
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('文件不存在');
  }
});

// 启动服务器
server.listen(port, () => {
  console.log(`简单测试服务器已启动，监听端口 ${port}`);
  console.log(`访问地址:`);
  console.log(`  http://localhost:${port}/test-api.html`);
  console.log(`  http://localhost:${port}/students.html`);
  console.log(`  http://localhost:${port}/`);
});

// 错误处理
server.on('error', (err) => {
  console.error('服务器错误:', err);
});
