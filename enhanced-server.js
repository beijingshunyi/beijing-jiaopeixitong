import http from 'node:http';
import { fileURLToPath } from 'node:url';
import { dirname, join, extname } from 'node:path';
import { readFileSync, statSync } from 'node:fs';

// 配置
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const publicDir = join(__dirname, 'public');
const port = 3000;

// 模拟数据
const mockUsers = [
  {
    id: '1',
    name: '管理员',
    email: 'admin@example.com',
    password: 'admin123',
    role_id: 1
  }
];

const mockStudents = [
  {
    id: '1',
    name: '张三',
    email: 'zhangsan@example.com',
    role_id: 4,
    college_id: '1',
    major_id: '1',
    class_id: '1',
    student_id: '2021001',
    phone: '13800138001',
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '2',
    name: '李四',
    email: 'lisi@example.com',
    role_id: 4,
    college_id: '1',
    major_id: '1',
    class_id: '1',
    student_id: '2021002',
    phone: '13800138002',
    created_at: '2024-01-02T00:00:00Z'
  }
];

// 创建服务器
const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const path = url.pathname;
  
  console.log(`请求: ${path}`);
  
  // 处理API端点
  if (path.startsWith('/api/') || path === '/health') {
    handleApiRequest(req, res, path);
    return;
  }
  
  // 处理静态文件
  handleStaticRequest(req, res, path);
});

// 处理API请求
function handleApiRequest(req, res, path) {
  // 健康检查
  if (path === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', message: '服务运行正常' }));
    console.log('返回健康检查响应');
    return;
  }
  
  // 登录API
  if (path === '/api/auth/login' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
    });
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        const user = mockUsers.find(u => u.email === data.email && u.password === data.password);
        
        if (user) {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            user: {
              id: user.id,
              name: user.name,
              email: user.email,
              role_id: user.role_id
            },
            token: 'mock-token-' + Date.now()
          }));
          console.log('登录成功:', user.email);
        } else {
          res.writeHead(401, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: '邮箱或密码错误' }));
          console.log('登录失败: 邮箱或密码错误');
        }
      } catch (error) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: '请求数据格式错误' }));
        console.error('登录请求错误:', error);
      }
    });
    return;
  }
  
  // 学生列表API
  if (path === '/api/staff/students' && req.method === 'GET') {
    // 检查认证头
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: '未授权' }));
      console.log('学生列表请求未授权');
      return;
    }
    
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ students: mockStudents }));
    console.log('返回学生列表，共', mockStudents.length, '条');
    return;
  }
  
  // API根路径
  if (path === '/api/') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
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
    }));
    console.log('返回API根路径响应');
    return;
  }
  
  // API端点不存在
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: '接口不存在' }));
  console.log('API端点不存在:', path);
}

// 处理静态文件请求
function handleStaticRequest(req, res, path) {
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
  
  // 处理其他静态文件
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
}

// 启动服务器
server.listen(port, () => {
  console.log(`增强版服务器已启动，监听端口 ${port}`);
  console.log(`访问地址:`);
  console.log(`  http://localhost:${port}/test-api.html`);
  console.log(`  http://localhost:${port}/students.html`);
  console.log(`  http://localhost:${port}/`);
  console.log(`API端点:`);
  console.log(`  http://localhost:${port}/health`);
  console.log(`  http://localhost:${port}/api/auth/login`);
  console.log(`  http://localhost:${port}/api/staff/students`);
  console.log(`
测试账号:`);
  console.log(`  邮箱: admin@example.com`);
  console.log(`  密码: admin123`);
});

// 错误处理
server.on('error', (err) => {
  console.error('服务器错误:', err);
});
