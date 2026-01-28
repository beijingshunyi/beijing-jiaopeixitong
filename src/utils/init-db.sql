-- 创建角色表
CREATE TABLE IF NOT EXISTS roles (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  description TEXT
);

-- 插入默认角色
INSERT INTO roles (name, description) VALUES
('admin', '管理员，拥有全部权限'),
('staff', '教务人员'),
('teacher', '教师'),
('student', '学生')
ON CONFLICT (name) DO NOTHING;

-- 创建学院表
CREATE TABLE IF NOT EXISTS colleges (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 创建专业表
CREATE TABLE IF NOT EXISTS majors (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  college_id INTEGER REFERENCES colleges(id),
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(name, college_id)
);

-- 创建班级表
CREATE TABLE IF NOT EXISTS classes (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  major_id INTEGER REFERENCES majors(id),
  year INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(name, major_id, year)
);

-- 创建用户扩展表（与Supabase Auth的users表关联）
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  name VARCHAR(100) NOT NULL,
  role_id INTEGER REFERENCES roles(id),
  college_id INTEGER REFERENCES colleges(id),
  major_id INTEGER REFERENCES majors(id),
  class_id INTEGER REFERENCES classes(id),
  student_id VARCHAR(50), -- 学号
  teacher_id VARCHAR(50), -- 工号
  phone VARCHAR(20),
  email VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 创建课程表
CREATE TABLE IF NOT EXISTS courses (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  code VARCHAR(50) NOT NULL UNIQUE,
  credit NUMERIC(3,1) NOT NULL,
  hours INTEGER NOT NULL,
  college_id INTEGER REFERENCES colleges(id),
  teacher_id UUID REFERENCES user_profiles(id),
  semester VARCHAR(20) NOT NULL,
  year INTEGER NOT NULL,
  capacity INTEGER NOT NULL,
  status VARCHAR(20) DEFAULT 'available', -- available, closed
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 创建选课记录表
CREATE TABLE IF NOT EXISTS course_selections (
  id SERIAL PRIMARY KEY,
  student_id UUID REFERENCES user_profiles(id),
  course_id INTEGER REFERENCES courses(id),
  status VARCHAR(20) DEFAULT 'enrolled', -- enrolled, dropped
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(student_id, course_id)
);

-- 创建成绩表
CREATE TABLE IF NOT EXISTS grades (
  id SERIAL PRIMARY KEY,
  student_id UUID REFERENCES user_profiles(id),
  course_id INTEGER REFERENCES courses(id),
  score NUMERIC(5,2),
  grade VARCHAR(10),
  teacher_id UUID REFERENCES user_profiles(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(student_id, course_id)
);

-- 创建评价表
CREATE TABLE IF NOT EXISTS evaluations (
  id SERIAL PRIMARY KEY,
  student_id UUID REFERENCES user_profiles(id),
  course_id INTEGER REFERENCES courses(id),
  teacher_id UUID REFERENCES user_profiles(id),
  score NUMERIC(3,1) NOT NULL,
  comment TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 创建教学计划表
CREATE TABLE IF NOT EXISTS teaching_plans (
  id SERIAL PRIMARY KEY,
  major_id INTEGER REFERENCES majors(id),
  course_id INTEGER REFERENCES courses(id),
  semester INTEGER NOT NULL, -- 1-8
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 创建培养方案表
CREATE TABLE IF NOT EXISTS training_programs (
  id SERIAL PRIMARY KEY,
  major_id INTEGER REFERENCES majors(id),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  credits_required NUMERIC(5,1) NOT NULL,
  duration INTEGER NOT NULL, -- 学制（年）
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 创建申请表
CREATE TABLE IF NOT EXISTS applications (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES user_profiles(id),
  type VARCHAR(50) NOT NULL, -- course_creation, course_completion, etc.
  status VARCHAR(20) DEFAULT 'pending', -- pending, approved, rejected
  content JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 创建用户角色关联表（用于细粒度权限控制）
CREATE TABLE IF NOT EXISTS user_roles (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES user_profiles(id),
  role_id INTEGER REFERENCES roles(id),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, role_id)
);
