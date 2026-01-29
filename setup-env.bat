@echo off
chcp 65001 >nul
cls
echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║                                                            ║
echo ║          教培系统后端 - 环境变量配置向导                  ║
echo ║                                                            ║
echo ╚════════════════════════════════════════════════════════════╝
echo.
echo 请选择你要部署的平台:
echo.
echo   [1] Cloudflare Workers
echo   [2] Vercel
echo   [3] 两个都配置
echo   [4] 查看配置说明
echo   [0] 退出
echo.
set /p choice="请输入选项 (0-4): "

if "%choice%"=="1" goto cloudflare
if "%choice%"=="2" goto vercel
if "%choice%"=="3" goto both
if "%choice%"=="4" goto guide
if "%choice%"=="0" goto end
goto invalid

:cloudflare
cls
echo.
echo ════════════════════════════════════════════════════════════
echo   配置 Cloudflare Workers
echo ════════════════════════════════════════════════════════════
echo.
echo 步骤 1: 确保已登录 Cloudflare
echo.
set /p login="是否已登录 Cloudflare? (y/n): "
if /i "%login%"=="n" (
    echo.
    echo 正在打开登录...
    wrangler login
    echo.
    pause
)

echo.
echo 步骤 2: 配置环境变量
echo.
echo 正在运行配置脚本...
call setup-cloudflare-secrets.bat
goto end

:vercel
cls
echo.
echo ════════════════════════════════════════════════════════════
echo   配置 Vercel
echo ════════════════════════════════════════════════════════════
echo.
echo 你有两种配置方式:
echo.
echo   [1] 使用 Vercel CLI (命令行)
echo   [2] 使用 Vercel 控制台 (图形界面，推荐)
echo.
set /p vercel_choice="请选择 (1-2): "

if "%vercel_choice%"=="1" goto vercel_cli
if "%vercel_choice%"=="2" goto vercel_console
goto invalid

:vercel_cli
echo.
echo 步骤 1: 检查 Vercel CLI
where vercel >nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo Vercel CLI 未安装，正在安装...
    npm install -g vercel
)

echo.
echo 步骤 2: 登录 Vercel
vercel login

echo.
echo 步骤 3: 配置环境变量
call setup-vercel-env.bat
goto end

:vercel_console
cls
echo.
echo ════════════════════════════════════════════════════════════
echo   Vercel 控制台配置步骤
echo ════════════════════════════════════════════════════════════
echo.
echo 1. 打开浏览器访问: https://vercel.com/dashboard
echo.
echo 2. 登录你的 Vercel 账号
echo.
echo 3. 选择你的项目（或创建新项目）
echo.
echo 4. 点击 Settings ^> Environment Variables
echo.
echo 5. 添加以下 5 个环境变量:
echo.
echo    ┌─────────────────────────────────────────────────────────┐
echo    │ SUPABASE_URL                                            │
echo    │ https://efehecndsjiazcjgzjkl.supabase.co               │
echo    └─────────────────────────────────────────────────────────┘
echo.
echo    ┌─────────────────────────────────────────────────────────┐
echo    │ SUPABASE_ANON_KEY                                       │
echo    │ eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBh │
echo    │ YmFzZSIsInJlZiI6ImVmZWhlY25kc2ppYXpjamd6amtsIiwicm9s │
echo    │ ZSI6ImFub24iLCJpYXQiOjE3Njk1Njg1OTYsImV4cCI6MjA4NTE0 │
echo    │ NDU5Nn0.UfZ0DOGiClrdiPhddMp1daD2nLgGWOuYodDO9uzxRWA   │
echo    └─────────────────────────────────────────────────────────┘
echo.
echo    ┌─────────────────────────────────────────────────────────┐
echo    │ SUPABASE_SERVICE_ROLE_KEY                               │
echo    │ eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBh │
echo    │ YmFzZSIsInJlZiI6ImVmZWhlY25kc2ppYXpjamd6amtsIiwicm9s │
echo    │ ZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTU2ODU5NiwiZXhw │
echo    │ IjoyMDg1MTQ0NTk2fQ.PDicjesrx-gnsqMazVj0pHzr4dRr01BD0 │
echo    │ Z57hwhV3oQ                                              │
echo    └─────────────────────────────────────────────────────────┘
echo.
echo    ┌─────────────────────────────────────────────────────────┐
echo    │ JWT_SECRET                                              │
echo    │ QingLing_Dance_Art_Center_Secure_JWT_Secret_Key_2024_  │
echo    │ Enhanced_Security                                       │
echo    └─────────────────────────────────────────────────────────┘
echo.
echo    ┌─────────────────────────────────────────────────────────┐
echo    │ PORT                                                    │
echo    │ 3000                                                    │
echo    └─────────────────────────────────────────────────────────┘
echo.
echo 6. 每个变量选择环境: Production, Preview, Development (全选)
echo.
echo 7. 点击 Save 保存
echo.
echo 8. 重新部署项目
echo.
set /p open="是否现在打开 Vercel 控制台? (y/n): "
if /i "%open%"=="y" (
    start https://vercel.com/dashboard
)
goto end

:both
call :cloudflare
echo.
echo ════════════════════════════════════════════════════════════
echo.
call :vercel
goto end

:guide
cls
echo.
echo 正在打开配置指南...
start DEPLOYMENT_GUIDE.md
goto end

:invalid
echo.
echo 无效的选项，请重新运行脚本。
pause
goto end

:end
echo.
echo ════════════════════════════════════════════════════════════
echo   配置完成！
echo ════════════════════════════════════════════════════════════
echo.
echo 下一步:
echo   - Cloudflare Workers: npm run deploy
echo   - Vercel: vercel --prod
echo.
echo 查看详细文档: DEPLOYMENT_GUIDE.md
echo.
pause
