const http = require('http');

// 测试健康检查端点
console.log('测试健康检查端点...');
const healthOptions = {
  hostname: 'localhost',
  port: 3000,
  path: '/health',
  method: 'GET'
};

const healthReq = http.request(healthOptions, (res) => {
  console.log(`健康检查状态码: ${res.statusCode}`);
  console.log(`健康检查响应头: ${JSON.stringify(res.headers)}`);
  res.on('data', (chunk) => {
    console.log(`健康检查响应体: ${chunk}`);
  });
});

healthReq.on('error', (e) => {
  console.error(`健康检查请求失败: ${e.message}`);
});
healthReq.end();

// 测试test-api.html
setTimeout(() => {
  console.log('\n测试test-api.html...');
  const testOptions = {
    hostname: 'localhost',
    port: 3000,
    path: '/test-api.html',
    method: 'GET'
  };

  const testReq = http.request(testOptions, (res) => {
    console.log(`test-api.html状态码: ${res.statusCode}`);
    console.log(`test-api.html响应头: ${JSON.stringify(res.headers)}`);
    
    let responseBody = '';
    res.on('data', (chunk) => {
      responseBody += chunk;
    });
    
    res.on('end', () => {
      console.log(`test-api.html响应体长度: ${responseBody.length} 字节`);
      console.log(`test-api.html响应体前200字符: ${responseBody.substring(0, 200)}...`);
    });
  });

  testReq.on('error', (e) => {
    console.error(`test-api.html请求失败: ${e.message}`);
  });
  testReq.end();
}, 1000);

// 测试students.html
setTimeout(() => {
  console.log('\n测试students.html...');
  const studentsOptions = {
    hostname: 'localhost',
    port: 3000,
    path: '/students.html',
    method: 'GET'
  };

  const studentsReq = http.request(studentsOptions, (res) => {
    console.log(`students.html状态码: ${res.statusCode}`);
    console.log(`students.html响应头: ${JSON.stringify(res.headers)}`);
    
    let responseBody = '';
    res.on('data', (chunk) => {
      responseBody += chunk;
    });
    
    res.on('end', () => {
      console.log(`students.html响应体长度: ${responseBody.length} 字节`);
      console.log(`students.html响应体前200字符: ${responseBody.substring(0, 200)}...`);
    });
  });

  studentsReq.on('error', (e) => {
    console.error(`students.html请求失败: ${e.message}`);
  });
  studentsReq.end();
}, 2000);
