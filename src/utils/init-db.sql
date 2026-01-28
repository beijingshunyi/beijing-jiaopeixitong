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
  remaining_hours INTEGER, -- 剩余课时
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

-- 创建考勤表
CREATE TABLE IF NOT EXISTS attendance (
  id SERIAL PRIMARY KEY,
  student_id UUID REFERENCES user_profiles(id),
  course_id INTEGER REFERENCES courses(id),
  date DATE NOT NULL,
  time TIMESTAMP NOT NULL,
  status VARCHAR(20) DEFAULT 'present', -- present, absent, late
  location TEXT,
  device_info JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(student_id, course_id, date)
);

-- 添加索引以提高查询性能
-- 用户表索引
CREATE INDEX IF NOT EXISTS idx_user_profiles_role_id ON user_profiles(role_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_college_id ON user_profiles(college_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_major_id ON user_profiles(major_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_class_id ON user_profiles(class_id);

-- 课程表索引
CREATE INDEX IF NOT EXISTS idx_courses_teacher_id ON courses(teacher_id);
CREATE INDEX IF NOT EXISTS idx_courses_college_id ON courses(college_id);
CREATE INDEX IF NOT EXISTS idx_courses_semester_year ON courses(semester, year);
CREATE INDEX IF NOT EXISTS idx_courses_status ON courses(status);

-- 选课表索引
CREATE INDEX IF NOT EXISTS idx_course_selections_student_id ON course_selections(student_id);
CREATE INDEX IF NOT EXISTS idx_course_selections_course_id ON course_selections(course_id);
CREATE INDEX IF NOT EXISTS idx_course_selections_status ON course_selections(status);

-- 成绩表索引
CREATE INDEX IF NOT EXISTS idx_grades_student_id ON grades(student_id);
CREATE INDEX IF NOT EXISTS idx_grades_course_id ON grades(course_id);
CREATE INDEX IF NOT EXISTS idx_grades_teacher_id ON grades(teacher_id);

-- 评价表索引
CREATE INDEX IF NOT EXISTS idx_evaluations_student_id ON evaluations(student_id);
CREATE INDEX IF NOT EXISTS idx_evaluations_course_id ON evaluations(course_id);
CREATE INDEX IF NOT EXISTS idx_evaluations_teacher_id ON evaluations(teacher_id);

-- 考勤表索引
CREATE INDEX IF NOT EXISTS idx_attendance_student_id ON attendance(student_id);
CREATE INDEX IF NOT EXISTS idx_attendance_course_id ON attendance(course_id);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance(date);
CREATE INDEX IF NOT EXISTS idx_attendance_status ON attendance(status);

-- 申请表索引
CREATE INDEX IF NOT EXISTS idx_applications_user_id ON applications(user_id);
CREATE INDEX IF NOT EXISTS idx_applications_type ON applications(type);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);

-- 教学计划表索引
CREATE INDEX IF NOT EXISTS idx_teaching_plans_major_id ON teaching_plans(major_id);
CREATE INDEX IF NOT EXISTS idx_teaching_plans_course_id ON teaching_plans(course_id);

-- 培养方案表索引
CREATE INDEX IF NOT EXISTS idx_training_programs_major_id ON training_programs(major_id);
