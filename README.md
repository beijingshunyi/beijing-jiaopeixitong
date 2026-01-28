# 教培系统后端

## 项目介绍

这是一个基于 Node.js 和 Hono 框架开发的教培系统后端，支持四种用户角色（管理员、教务人员、教师、学生），提供完整的教培机构管理功能，包括课程管理、学生管理、考勤管理、财务管理等。

## 技术栈

- **框架**: Hono (轻量级、高性能的API框架，支持Cloudflare Workers)
- **数据库**: PostgreSQL (通过Supabase)
- **认证**: JWT (JSON Web Token)
- **部署**: Vercel, Cloudflare Workers

## 系统架构

- **控制器层**: 处理HTTP请求和响应
- **服务层**: 实现业务逻辑
- **中间件**: 处理认证和授权
- **数据库**: PostgreSQL + Supabase

## 目录结构

```
backend/
├── src/
│   ├── controllers/       # 控制器
│   │   ├── auth.js        # 认证控制器
│   │   ├── student.js     # 学生控制器
│   │   ├── teacher.js     # 教师控制器
│   │   ├── staff.js       # 教务人员控制器
│   │   └── admin.js       # 管理员控制器
│   ├── middleware/        # 中间件
│   │   └── auth.js        # 认证中间件
│   ├── services/          # 服务层
│   │   ├── auth.js        # 认证服务
│   │   └── supabase.js    # Supabase客户端
│   ├── utils/             # 工具
│   │   └── init-db.sql    # 数据库初始化脚本
│   └── index.js           # 主入口
├── public/                # 静态文件
│   └── index.html         # 后台管理面板
├── vercel.json            # Vercel部署配置
├── package.json           # 依赖管理
└── README.md              # 说明文档
```

## 快速开始

### 环境要求

- Node.js 18+
- Supabase 项目

### 安装依赖

```bash
npm install
```

### 环境变量

创建 `.env` 文件并配置以下环境变量：

```env
# Supabase配置
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# JWT配置
JWT_SECRET=your-jwt-secret
```

### 数据库初始化

1. 登录 Supabase 控制台
2. 创建新的项目
3. 在 SQL 编辑器中执行 `src/utils/init-db.sql` 脚本

### 本地开发

```bash
npm run dev
```

### 部署到 Vercel

1. 登录 Vercel 控制台
2. 导入项目
3. 配置环境变量
4. 部署

### 部署到 Cloudflare Workers

1. 登录 Cloudflare 控制台
2. 创建新的 Worker
3. 配置环境变量
4. 部署

## API 文档

### 认证接口

- **POST /api/auth/register**: 注册新用户
- **POST /api/auth/login**: 用户登录
- **POST /api/auth/refresh**: 刷新令牌
- **POST /api/auth/logout**: 用户登出
- **GET /api/auth/me**: 获取当前用户信息

### 学生接口

- **GET /api/student/dashboard**: 获取学生仪表盘
- **GET /api/student/courses/available**: 获取可选课程
- **POST /api/student/courses/enroll**: 选课
- **POST /api/student/courses/drop**: 退课
- **GET /api/student/courses/enrolled**: 获取已选课程
- **GET /api/student/grades**: 获取成绩
- **GET /api/student/schedule**: 获取课表
- **POST /api/student/evaluations**: 提交课程评价
- **GET /api/student/teaching-plan**: 获取教学计划
- **GET /api/student/training-program**: 获取培养方案
- **PUT /api/student/profile**: 更新个人信息
- **POST /api/student/password**: 修改密码
- **POST /api/student/checkin**: 打卡
- **GET /api/student/attendance**: 获取打卡记录
- **GET /api/student/remaining-hours**: 获取剩余课时

### 教师接口

- **GET /api/teacher/courses**: 获取教师的课程
- **GET /api/teacher/courses/:courseId/students**: 获取课程学生列表
- **POST /api/teacher/grades**: 录入成绩
- **GET /api/teacher/courses/:courseId/evaluations**: 获取课程评价
- **GET /api/teacher/schedule**: 获取教师课表
- **GET /api/teacher/courses/:courseId/statistics**: 获取成绩统计
- **PUT /api/teacher/profile**: 更新个人信息
- **POST /api/teacher/courses/apply**: 申请开课
- **GET /api/teacher/applications**: 获取申请记录

### 教务人员接口

- **GET /api/staff/colleges**: 获取学院列表
- **POST /api/staff/colleges**: 创建学院
- **PUT /api/staff/colleges/:id**: 更新学院
- **DELETE /api/staff/colleges/:id**: 删除学院
- **GET /api/staff/majors**: 获取专业列表
- **POST /api/staff/majors**: 创建专业
- **PUT /api/staff/majors/:id**: 更新专业
- **DELETE /api/staff/majors/:id**: 删除专业
- **GET /api/staff/classes**: 获取班级列表
- **POST /api/staff/classes**: 创建班级
- **PUT /api/staff/classes/:id**: 更新班级
- **DELETE /api/staff/classes/:id**: 删除班级
- **GET /api/staff/teaching-plans**: 获取教学计划
- **POST /api/staff/teaching-plans**: 创建教学计划
- **DELETE /api/staff/teaching-plans/:id**: 删除教学计划
- **GET /api/staff/training-programs**: 获取培养方案
- **POST /api/staff/training-programs**: 创建培养方案
- **PUT /api/staff/training-programs/:id**: 更新培养方案
- **DELETE /api/staff/training-programs/:id**: 删除培养方案
- **GET /api/staff/applications**: 获取申请列表
- **PUT /api/staff/applications/:id**: 处理申请
- **GET /api/staff/students**: 获取学生列表
- **GET /api/staff/evaluations**: 获取评价列表

### 管理员接口

- **GET /api/admin/users**: 获取用户列表
- **POST /api/admin/users**: 创建用户
- **PUT /api/admin/users/:id**: 更新用户
- **DELETE /api/admin/users/:id**: 删除用户
- **POST /api/admin/users/reset-password**: 重置密码
- **GET /api/admin/roles**: 获取角色列表
- **POST /api/admin/roles**: 创建角色
- **PUT /api/admin/roles/:id**: 更新角色
- **DELETE /api/admin/roles/:id**: 删除角色
- **GET /api/admin/users/:userId/roles**: 获取用户角色
- **POST /api/admin/users/roles**: 分配角色
- **DELETE /api/admin/users/roles**: 移除角色
- **GET /api/admin/stats**: 获取系统统计

## 后台管理面板

系统提供了完整的后台管理面板，访问根路径即可进入：

```
https://your-domain.com/
```

后台管理面板功能包括：

- 系统概览
- 用户管理
- 课程管理
- 考勤管理
- 财务管理
- 统计报表
- 系统设置
- API测试工具

## 系统功能

### 学生功能

- 课程选择和退课
- 成绩查询
- 课表查询
- 课程评价
- 教学计划和培养方案查询
- 个人信息管理
- 打卡功能
- 课时自动扣除

### 教师功能

- 课程管理
- 学生管理
- 成绩录入和统计
- 课程评价查询
- 个人课表查询
- 开课申请

### 教务人员功能

- 学院管理
- 专业管理
- 班级管理
- 教学计划管理
- 培养方案管理
- 申请处理
- 学生管理
- 评价管理

### 管理员功能

- 用户管理
- 角色管理
- 权限管理
- 系统统计

## 安全措施

- JWT认证
- 角色授权
- 速率限制
- 数据库索引优化
- 输入验证

## 性能优化

- 数据库索引
- 缓存策略
- 速率限制
- 代码优化

## 常见问题

### 1. 接口返回401错误

**原因**: 认证失败，可能是令牌过期或无效
**解决方法**: 重新登录获取新令牌

### 2. 接口返回403错误

**原因**: 权限不足，当前用户没有访问该接口的权限
**解决方法**: 检查用户角色和权限

### 3. 数据库连接失败

**原因**: Supabase配置错误或网络问题
**解决方法**: 检查环境变量配置和网络连接

### 4. 部署到Vercel后接口返回404

**原因**: 路由配置错误
**解决方法**: 确保vercel.json配置正确

## 贡献

欢迎贡献代码和提出建议！

## 许可证

MIT License
