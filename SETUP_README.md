# 🚀 快速配置环境变量

## 最简单的方法

双击运行 `setup-env.bat`，按照向导操作即可！

## 📁 配置文件说明

| 文件 | 用途 |
|------|------|
| `setup-env.bat` | **主配置向导**（推荐使用） |
| `setup-cloudflare-secrets.bat` | Cloudflare Workers 自动配置 |
| `setup-vercel-env.bat` | Vercel CLI 自动配置 |
| `DEPLOYMENT_GUIDE.md` | 详细配置文档 |

## 🎯 快速开始

### 方式一：使用配置向导（最简单）

1. 双击 `setup-env.bat`
2. 选择你要部署的平台
3. 按照提示操作

### 方式二：Cloudflare Workers

```bash
# 1. 登录 Cloudflare
wrangler login

# 2. 运行配置脚本
setup-cloudflare-secrets.bat

# 3. 部署
npm run deploy
```

### 方式三：Vercel 控制台（推荐新手）

1. 访问 https://vercel.com/dashboard
2. 选择项目 > Settings > Environment Variables
3. 添加以下 5 个变量（复制粘贴即可）：

```
SUPABASE_URL
https://efehecndsjiazcjgzjkl.supabase.co

SUPABASE_ANON_KEY
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVmZWhlY25kc2ppYXpjamd6amtsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk1Njg1OTYsImV4cCI6MjA4NTE0NDU5Nn0.UfZ0DOGiClrdiPhddMp1daD2nLgGWOuYodDO9uzxRWA

SUPABASE_SERVICE_ROLE_KEY
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVmZWhlY25kc2ppYXpjamd6amtsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTU2ODU5NiwiZXhwIjoyMDg1MTQ0NTk2fQ.PDicjesrx-gnsqMazVj0pHzr4dRr01BD0Z57hwhV3oQ

JWT_SECRET
QingLing_Dance_Art_Center_Secure_JWT_Secret_Key_2024_Enhanced_Security

PORT
3000
```

4. 每个变量选择环境：Production, Preview, Development（全选）
5. 保存并重新部署

## ✅ 验证配置

### Cloudflare Workers
```bash
wrangler secret list
```
应该看到 5 个 secrets

### Vercel
访问 Vercel 控制台 > 项目 > Settings > Environment Variables
应该看到 5 个变量

## 🆘 遇到问题？

查看详细文档：`DEPLOYMENT_GUIDE.md`

或者检查：
- 是否已登录对应平台
- 网络连接是否正常
- CLI 工具是否已安装

## 📞 常用命令

```bash
# 安装 Cloudflare CLI
npm install -g wrangler

# 安装 Vercel CLI
npm install -g vercel

# 登录 Cloudflare
wrangler login

# 登录 Vercel
vercel login

# 部署到 Cloudflare
npm run deploy

# 部署到 Vercel
vercel --prod
```

---

**提示**：如果你不熟悉命令行，强烈推荐使用 Vercel 控制台的图形界面配置！
