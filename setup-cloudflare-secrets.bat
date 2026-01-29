@echo off
chcp 65001 >nul
echo ========================================
echo Cloudflare Workers 环境变量配置脚本
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
echo 开始配置 Cloudflare Workers Secrets...
echo.

echo [1/5] 配置 SUPABASE_URL...
echo https://efehecndsjiazcjgzjkl.supabase.co | wrangler secret put SUPABASE_URL

echo.
echo [2/5] 配置 SUPABASE_ANON_KEY...
echo eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVmZWhlY25kc2ppYXpjamd6amtsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk1Njg1OTYsImV4cCI6MjA4NTE0NDU5Nn0.UfZ0DOGiClrdiPhddMp1daD2nLgGWOuYodDO9uzxRWA | wrangler secret put SUPABASE_ANON_KEY

echo.
echo [3/5] 配置 SUPABASE_SERVICE_ROLE_KEY...
echo eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVmZWhlY25kc2ppYXpjamd6amtsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTU2ODU5NiwiZXhwIjoyMDg1MTQ0NTk2fQ.PDicjesrx-gnsqMazVj0pHzr4dRr01BD0Z57hwhV3oQ | wrangler secret put SUPABASE_SERVICE_ROLE_KEY

echo.
echo [4/5] 配置 JWT_SECRET...
echo QingLing_Dance_Art_Center_Secure_JWT_Secret_Key_2024_Enhanced_Security | wrangler secret put JWT_SECRET

echo.
echo [5/5] 配置 PORT...
echo 3000 | wrangler secret put PORT

echo.
echo ========================================
echo ✓ 所有环境变量配置完成！
echo ========================================
echo.
echo 你现在可以使用以下命令部署:
echo   npm run deploy
echo 或
echo   wrangler deploy
echo.
pause
