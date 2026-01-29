# 环境变量配置指南

本文档提供了在 Cloudflare Workers 和 Vercel 上配置环境变量的详细步骤。

## 📋 需要配置的环境变量

```
SUPABASE_URL=https://efehecndsjiazcjgzjkl.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVmZWhlY25kc2ppYXpjamd6amtsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk1Njg1OTYsImV4cCI6MjA4NTE0NDU5Nn0.UfZ0DOGiClrdiPhddMp1daD2nLgGWOuYodDO9uzxRWA
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVmZWhlY25kc2ppYXpjamd6amtsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTU2ODU5NiwiZXhwIjoyMDg1MTQ0NTk2fQ.PDicjesrx-gnsqMazVj0pHzr4dRr01BD0Z57hwhV3oQ
JWT_SECRET=QingLing_Dance_Art_Center_Secure_JWT_Secret_Key_2024_Enhanced_Security
PORT=3000
```

---

## 🚀 方法一：Cloudflare Workers 配置

### 选项 A：使用自动配置脚本（推荐）

1. **确保已登录 Cloudflare**
   ```bash
   cd backend
   wrangler login
   ```
   这会打开浏览器，让你登录 Cloudflare 账号。

2. **运行配置脚本**
   ```bash
   setup-cloudflare-secrets.bat
   ```
   脚本会自动配置所有环境变量。

3. **验证配置**
   ```bash
   wrangler secret list
   ```
   你应该看到所有 5 个 secrets。

4. **部署**
   ```bash
   npm run deploy
   ```

### 选项 B：手动配置

如果自动脚本不工作，可以手动执行以下命令：

```bash
cd backend

# 1. 配置 SUPABASE_URL
echo https://efehecndsjiazcjgzjkl.supabase.co | wrangler secret put SUPABASE_URL

# 2. 配置 SUPABASE_ANON_KEY
echo eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVmZWhlY25kc2ppYXpjamd6amtsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk1Njg1OTYsImV4cCI6MjA4NTE0NDU5Nn0.UfZ0DOGiClrdiPhddMp1daD2nLgGWOuYodDO9uzxRWA | wrangler secret put SUPABASE_ANON_KEY

# 3. 配置 SUPABASE_SERVICE_ROLE_KEY
echo eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVmZWhlY25kc2ppYXpjamd6amtsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTU2ODU5NiwiZXhwIjoyMDg1MTQ0NTk2fQ.PDicjesrx-gnsqMazVj0pHzr4dRr01BD0Z57hwhV3oQ | wrangler secret put SUPABASE_SERVICE_ROLE_KEY

# 4. 配置 JWT_SECRET
echo QingLing_Dance_Art_Center_Secure_JWT_Secret_Key_2024_Enhanced_Security | wrangler secret put JWT_SECRET

# 5. 配置 PORT
echo 3000 | wrangler secret put PORT
```

### 选项 C：通过 Cloudflare 控制台配置

1. 访问 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 进入 **Workers & Pages**
3. 选择你的 Worker 项目（jiaopeifuwuqi）
4. 点击 **Settings** > **Variables**
5. 在 **Environment Variables** 部分，点击 **Add variable**
6. 逐个添加以下变量（选择 **Encrypt** 类型）：

| Variable Name | Value |
|--------------|-------|
| SUPABASE_URL | https://efehecndsjiazcjgzjkl.supabase.co |
| SUPABASE_ANON_KEY | eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVmZWhlY25kc2ppYXpjamd6amtsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk1Njg1OTYsImV4cCI6MjA4NTE0NDU5Nn0.UfZ0DOGiClrdiPhddMp1daD2nLgGWOuYodDO9uzxRWA |
| SUPABASE_SERVICE_ROLE_KEY | eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVmZWhlY25kc2ppYXpjamd6amtsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTU2ODU5NiwiZXhwIjoyMDg1MTQ0NTk2fQ.PDicjesrx-gnsqMazVj0pHzr4dRr01BD0Z57hwhV3oQ |
| JWT_SECRET | QingLing_Dance_Art_Center_Secure_JWT_Secret_Key_2024_Enhanced_Security |
| PORT | 3000 |

7. 点击 **Save** 保存每个变量

---

## 🌐 方法二：Vercel 配置

### 选项 A：通过 Vercel 控制台配置（最简单）

1. **访问 Vercel 控制台**
   - 打开 [Vercel Dashboard](https://vercel.com/dashboard)
   - 登录你的账号

2. **选择或创建项目**
   - 如果还没有项目，点击 **Add New** > **Project**
   - 导入你的 GitHub 仓库（需要先将代码推送到 GitHub）
   - 如果已有项目，直接选择项目

3. **配置环境变量**
   - 在项目页面，点击 **Settings**
   - 在左侧菜单选择 **Environment Variables**
   - 点击 **Add New** 按钮

4. **逐个添加变量**

   对于每个变量，执行以下操作：
   - 在 **Key** 输入变量名
   - 在 **Value** 输入变量值
   - 选择环境：**Production**, **Preview**, **Development**（建议全选）
   - 点击 **Save**

   需要添加的变量：

   | Key | Value | 环境 |
   |-----|-------|------|
   | SUPABASE_URL | https://efehecndsjiazcjgzjkl.supabase.co | All |
   | SUPABASE_ANON_KEY | eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVmZWhlY25kc2ppYXpjamd6amtsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk1Njg1OTYsImV4cCI6MjA4NTE0NDU5Nn0.UfZ0DOGiClrdiPhddMp1daD2nLgGWOuYodDO9uzxRWA | All |
   | SUPABASE_SERVICE_ROLE_KEY | eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVmZWhlY25kc2ppYXpjamd6amtsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTU2ODU5NiwiZXhwIjoyMDg1MTQ0NTk2fQ.PDicjesrx-gnsqMazVj0pHzr4dRr01BD0Z57hwhV3oQ | All |
   | JWT_SECRET | QingLing_Dance_Art_Center_Secure_JWT_Secret_Key_2024_Enhanced_Security | All |
   | PORT | 3000 | All |

5. **重新部署**
   - 配置完成后，点击 **Deployments** 标签
   - 点击最新部署右侧的 **...** 菜单
   - 选择 **Redeploy**

### 选项 B：使用 Vercel CLI（命令行）

1. **安装 Vercel CLI**（如果还没安装）
   ```bash
   npm install -g vercel
   ```

2. **登录 Vercel**
   ```bash
   vercel login
   ```

3. **链接项目**（首次部署）
   ```bash
   cd backend
   vercel
   ```
   按照提示完成项目设置。

4. **使用自动配置脚本**
   ```bash
   setup-vercel-env.bat
   ```

   或者手动执行：
   ```bash
   # 配置 production 环境变量
   vercel env add SUPABASE_URL production
   # 粘贴: https://efehecndsjiazcjgzjkl.supabase.co

   vercel env add SUPABASE_ANON_KEY production
   # 粘贴: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVmZWhlY25kc2ppYXpjamd6amtsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk1Njg1OTYsImV4cCI6MjA4NTE0NDU5Nn0.UfZ0DOGiClrdiPhddMp1daD2nLgGWOuYodDO9uzxRWA

   vercel env add SUPABASE_SERVICE_ROLE_KEY production
   # 粘贴: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVmZWhlY25kc2ppYXpjamd6amtsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTU2ODU5NiwiZXhwIjoyMDg1MTQ0NTk2fQ.PDicjesrx-gnsqMazVj0pHzr4dRr01BD0Z57hwhV3oQ

   vercel env add JWT_SECRET production
   # 粘贴: QingLing_Dance_Art_Center_Secure_JWT_Secret_Key_2024_Enhanced_Security

   vercel env add PORT production
   # 粘贴: 3000
   ```

5. **部署到生产环境**
   ```bash
   vercel --prod
   ```

---

## 📸 Vercel 控制台配置截图说明

### 步骤 1：进入项目设置
![Vercel Settings](https://vercel.com/docs/concepts/projects/environment-variables)

### 步骤 2：添加环境变量
1. 点击 "Environment Variables"
2. 点击 "Add New"
3. 输入 Key 和 Value
4. 选择环境（Production, Preview, Development）
5. 点击 "Save"

### 步骤 3：验证配置
- 在 Environment Variables 页面应该看到所有 5 个变量
- 每个变量旁边应该显示应用的环境

---

## ✅ 验证配置

### Cloudflare Workers
```bash
# 查看已配置的 secrets
wrangler secret list

# 测试部署
wrangler deploy

# 访问你的 Worker URL
curl https://jiaopeifuwuqi.your-subdomain.workers.dev/health
```

### Vercel
```bash
# 查看环境变量
vercel env ls

# 测试部署
vercel --prod

# 访问你的 Vercel URL
curl https://your-project.vercel.app/health
```

---

## 🔧 常见问题

### Q1: wrangler 命令找不到
**解决方案**：
```bash
npm install -g wrangler
```

### Q2: vercel 命令找不到
**解决方案**：
```bash
npm install -g vercel
```

### Q3: wrangler login 失败
**解决方案**：
- 确保浏览器可以访问 Cloudflare
- 尝试使用 API Token：`wrangler login --api-token YOUR_TOKEN`

### Q4: Vercel 部署后环境变量不生效
**解决方案**：
- 确保选择了正确的环境（Production/Preview/Development）
- 重新部署项目
- 检查 vercel.json 配置

### Q5: 如何更新已配置的环境变量？

**Cloudflare Workers**：
```bash
# 重新设置 secret（会覆盖旧值）
echo NEW_VALUE | wrangler secret put SECRET_NAME
```

**Vercel**：
- 在控制台删除旧变量，添加新变量
- 或使用 CLI：`vercel env rm VARIABLE_NAME` 然后 `vercel env add VARIABLE_NAME`

---

## 📝 总结

### 推荐配置方式

1. **Cloudflare Workers**：使用自动脚本 `setup-cloudflare-secrets.bat`
2. **Vercel**：使用控制台图形界面（最直观）

### 配置完成后

1. 测试健康检查端点：`/health`
2. 测试 API 端点：`/api/`
3. 尝试登录功能
4. 检查日志确认环境变量已加载

---

## 🆘 需要帮助？

如果遇到问题：
1. 检查 `.env` 文件是否存在且格式正确
2. 确认已登录对应平台（Cloudflare/Vercel）
3. 查看部署日志中的错误信息
4. 验证环境变量是否正确配置：`wrangler secret list` 或 Vercel 控制台

祝部署顺利！🚀
