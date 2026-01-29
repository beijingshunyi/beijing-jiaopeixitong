@echo off
chcp 65001 >nul
echo ========================================
echo Vercel 环境变量配置脚本
echo ========================================
echo.

cd /d "%~dp0"

echo 正在读取 .env 文件...
if not exist .env (
    echo 错误: .env 文件不存在！
    pause
    exit /b 1
)

echo.
echo 检查 Vercel CLI 是否已安装...
where vercel >nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo Vercel CLI 未安装！
    echo 请先运行: npm install -g vercel
    echo.
    pause
    exit /b 1
)

echo ✓ Vercel CLI 已安装
echo.
echo 开始配置 Vercel 环境变量...
echo 注意: 这些变量将应用到 production 环境
echo.

echo [1/5] 配置 SUPABASE_URL...
vercel env add SUPABASE_URL production
echo https://efehecndsjiazcjgzjkl.supabase.co

echo.
echo [2/5] 配置 SUPABASE_ANON_KEY...
vercel env add SUPABASE_ANON_KEY production
echo eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVmZWhlY25kc2ppYXpjamd6amtsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk1Njg1OTYsImV4cCI6MjA4NTE0NDU5Nn0.UfZ0DOGiClrdiPhddMp1daD2nLgGWOuYodDO9uzxRWA

echo.
echo [3/5] 配置 SUPABASE_SERVICE_ROLE_KEY...
vercel env add SUPABASE_SERVICE_ROLE_KEY production
echo eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVmZWhlY25kc2ppYXpjamd6amtsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTU2ODU5NiwiZXhwIjoyMDg1MTQ0NTk2fQ.PDicjesrx-gnsqMazVj0pHzr4dRr01BD0Z57hwhV3oQ

echo.
echo [4/5] 配置 JWT_SECRET...
vercel env add JWT_SECRET production
echo QingLing_Dance_Art_Center_Secure_JWT_Secret_Key_2024_Enhanced_Security

echo.
echo [5/5] 配置 PORT...
vercel env add PORT production
echo 3000

echo.
echo ========================================
echo ✓ 所有环境变量配置完成！
echo ========================================
echo.
echo 你现在可以使用以下命令部署:
echo   vercel --prod
echo.
pause
