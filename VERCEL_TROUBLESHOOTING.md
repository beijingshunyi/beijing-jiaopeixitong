# Vercel 部署故障排查指南

## 已修复的问题

### 问题：500 FUNCTION_INVOCATION_FAILED

**原因**：
- Hono 应用需要特殊的适配器才能在 Vercel Serverless Functions 上运行
- 旧的 vercel.json 配置格式不兼容

**解决方案**：
1. ✅ 创建了 `api/index.js` 作为 Vercel 入口点
2. ✅ 实现了 Hono 到 Vercel 的适配器
3. ✅ 更新了 `vercel.json` 使用 rewrites 配置
4. ✅ 添加了完整的错误处理和日志

## 检查部署状态

### 方法 1：访问 Vercel 控制台

1. 访问 https://vercel.com/dashboard
2. 选择你的项目
3. 查看 "Deployments" 标签
4. 点击最新的部署查看详情

### 方法 2：查看部署日志

在 Vercel 控制台：
1. 点击最新的部署
2. 查看 "Build Logs" - 构建过程日志
3. 查看 "Function Logs" - 运行时日志
4. 查看 "Runtime Logs" - 实时日志

## 测试部署

### 1. 健康检查

```bash
curl https://beijing-jiaopeixitong.vercel.app/health
```

**预期响应**：
```json
{
  "status": "ok",
  "message": "服务运行正常"
}
```

### 2. API 信息

```bash
curl https://beijing-jiaopeixitong.vercel.app/api/
```

**预期响应**：
```json
{
  "message": "教培系统后端API",
  "version": "1.0.0",
  "endpoints": {
    "auth": "/api/auth/*",
    "student": "/api/student/*",
    "teacher": "/api/teacher/*",
    "staff": "/api/staff/*",
    "admin": "/api/admin/*"
  }
}
```

### 3. 管理面板

访问：https://beijing-jiaopeixitong.vercel.app/

应该看到管理系统界面。

## 常见问题

### Q1: 仍然显示 500 错误

**检查步骤**：
1. 确认最新代码已推送到 GitHub
2. 在 Vercel 控制台手动触发重新部署
3. 查看 Function Logs 中的错误信息
4. 确认环境变量已正确配置

**手动重新部署**：
- Vercel 控制台 → Deployments → 最新部署 → ... → Redeploy

### Q2: 环境变量未生效

**检查**：
```bash
# 在 Function Logs 中应该看到：
Environment variables loaded: {
  SUPABASE_URL: '✓',
  SUPABASE_ANON_KEY: '✓',
  SUPABASE_SERVICE_ROLE_KEY: '✓',
  JWT_SECRET: '✓'
}
```

**修复**：
- Settings → Environment Variables
- 确认所有 5 个变量都存在
- 确认选择了 Production 环境
- 重新部署

### Q3: 数据库连接失败

**错误信息**：
```
缺少必需的Supabase环境变量
```

**解决方案**：
1. 检查环境变量是否正确配置
2. 确认 Supabase URL 和 Keys 有效
3. 测试 Supabase 连接：
   ```bash
   curl https://efehecndsjiazcjgzjkl.supabase.co/rest/v1/
   ```

### Q4: CORS 错误

**症状**：前端无法访问 API

**解决方案**：
代码中已配置 CORS：
```javascript
c.header('Access-Control-Allow-Origin', '*');
c.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
c.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
```

如果仍有问题，检查：
- 请求是否包含正确的 Content-Type
- OPTIONS 预检请求是否成功

### Q5: 静态文件（admin.html）无法访问

**当前配置**：
所有请求都路由到 API，静态文件通过 Hono 的 serveStatic 提供。

**测试**：
```bash
curl https://beijing-jiaopeixitong.vercel.app/
```

应该返回 HTML 内容。

## 部署配置说明

### vercel.json

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/api"
    }
  ]
}
```

**说明**：
- 所有请求都重写到 `/api` 路径
- `/api/index.js` 处理所有请求
- Hono 应用内部处理路由

### api/index.js

这是 Vercel Serverless Function 的入口点：
- 接收 Vercel 的 req/res 对象
- 转换为 Fetch API 的 Request 对象
- 调用 Hono 应用的 fetch 方法
- 将 Response 转换回 Vercel 格式

### 项目结构

```
backend/
├── api/
│   └── index.js          # Vercel 入口点
├── src/
│   ├── index.js          # Hono 应用
│   ├── controllers/      # 控制器
│   ├── middleware/       # 中间件
│   ├── services/         # 服务
│   └── utils/            # 工具
├── public/               # 静态文件
├── vercel.json           # Vercel 配置
└── package.json          # 依赖配置
```

## 监控和调试

### 实时日志

在 Vercel 控制台：
1. 选择项目
2. 点击 "Logs" 标签
3. 实时查看请求日志

### 错误追踪

每个错误都包含：
- 错误消息
- 堆栈跟踪（开发环境）
- 请求 ID（用于追踪）

### 性能监控

Vercel 提供：
- 响应时间统计
- 函数执行时间
- 冷启动时间
- 带宽使用

## 下一步

部署成功后：

1. **初始化数据库**
   ```sql
   -- 在 Supabase SQL Editor 中执行
   -- 文件：src/utils/init-db.sql
   ```

2. **创建测试用户**
   ```bash
   curl -X POST https://beijing-jiaopeixitong.vercel.app/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{
       "email": "admin@example.com",
       "password": "password123",
       "name": "管理员",
       "role_id": 1
     }'
   ```

3. **测试登录**
   ```bash
   curl -X POST https://beijing-jiaopeixitong.vercel.app/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{
       "email": "admin@example.com",
       "password": "password123"
     }'
   ```

4. **访问管理面板**
   ```
   https://beijing-jiaopeixitong.vercel.app/
   ```

## 获取帮助

如果问题仍未解决：

1. **查看完整日志**
   - Vercel 控制台 → 项目 → Logs
   - 复制错误信息

2. **检查配置**
   - 环境变量
   - vercel.json
   - package.json

3. **本地测试**
   ```bash
   cd backend
   npm install
   npm run dev
   # 访问 http://localhost:3000/health
   ```

4. **联系支持**
   - Vercel 文档：https://vercel.com/docs
   - Hono 文档：https://hono.dev/

---

**提示**：Vercel 会在每次 Git 推送后自动部署。等待 1-2 分钟让部署完成，然后测试新版本。
