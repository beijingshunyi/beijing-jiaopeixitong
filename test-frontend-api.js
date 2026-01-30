import fetch from 'node-fetch';

// API配置
const API_BASE = 'http://localhost:3000/api';

async function testFrontendAPI() {
  console.log('=== 前端API测试 ===\n');
  
  try {
    // 模拟前端登录流程
    console.log('1. 测试登录...');
    const loginResponse = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@example.com',
        password: 'admin123'
      })
    });
    
    console.log(`登录状态码: ${loginResponse.status}`);
    const loginData = await loginResponse.json();
    console.log(`登录响应: ${JSON.stringify(loginData)}`);
    
    if (!loginData.token) {
      console.log('❌ 登录失败，无法获取token');
      return;
    }
    
    const token = loginData.token;
    console.log('✅ 登录成功，获取到token\n');
    
    // 测试学生列表API
    console.log('2. 测试学生列表API...');
    const studentsResponse = await fetch(`${API_BASE}/staff/students`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`学生列表状态码: ${studentsResponse.status}`);
    const studentsData = await studentsResponse.json();
    console.log(`学生列表响应: ${JSON.stringify(studentsData)}`);
    
    if (studentsData.error) {
      console.log('❌ 获取学生列表失败');
    } else {
      console.log(`✅ 获取学生列表成功，共 ${studentsData.students ? studentsData.students.length : 0} 名学生`);
    }
    
    console.log('\n=== 测试完成 ===');
    
  } catch (error) {
    console.error('❌ 测试过程中出错:', error.message);
    console.log('\n可能的问题:');
    console.log('1. 后端服务器未启动');
    console.log('2. API地址配置错误');
    console.log('3. 网络连接问题');
    console.log('4. 数据库连接问题');
  }
}

testFrontendAPI();
