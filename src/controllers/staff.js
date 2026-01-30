import { supabaseService } from '../services/supabase.js';

// 学院管理

// 获取学院列表
const getColleges = async (c) => {
  try {
    const { data: colleges, error } = await supabaseService
      .from('colleges')
      .select('*');

    if (error) {
      throw new Error('获取学院列表失败');
    }

    return c.json({ colleges });
  } catch (error) {
    return c.json({ error: error.message }, 400);
  }
};

// 创建学院
const createCollege = async (c) => {
  try {
    const { name, description } = await c.req.json();

    const { data: college, error } = await supabaseService
      .from('colleges')
      .insert({ name, description })
      .select()
      .single();

    if (error) {
      throw new Error('创建学院失败');
    }

    return c.json({ college }, 201);
  } catch (error) {
    return c.json({ error: error.message }, 400);
  }
};

// 更新学院
const updateCollege = async (c) => {
  try {
    const { id } = c.req.param();
    const { name, description } = await c.req.json();

    const { data: college, error } = await supabaseService
      .from('colleges')
      .update({ name, description, updated_at: new Date() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error('更新学院失败');
    }

    return c.json({ college });
  } catch (error) {
    return c.json({ error: error.message }, 400);
  }
};

// 删除学院
const deleteCollege = async (c) => {
  try {
    const { id } = c.req.param();

    // 检查是否有关联的专业
    const { data: majors, error: majorError } = await supabaseService
      .from('majors')
      .select('id')
      .eq('college_id', id);

    if (majorError) {
      throw new Error('检查关联专业失败');
    }

    if (majors.length > 0) {
      throw new Error('该学院下有关联的专业，无法删除');
    }

    const { error } = await supabaseService
      .from('colleges')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error('删除学院失败');
    }

    return c.json({ success: true, message: '学院删除成功' });
  } catch (error) {
    return c.json({ error: error.message }, 400);
  }
};

// 专业管理

// 获取专业列表
const getMajors = async (c) => {
  try {
    const { collegeId } = c.req.query();

    let query = supabaseService
      .from('majors')
      .select(`
        id,
        name,
        description,
        colleges(name) as college
      `);

    if (collegeId) {
      query = query.eq('college_id', collegeId);
    }

    const { data: majors, error } = await query;

    if (error) {
      throw new Error('获取专业列表失败');
    }

    return c.json({ majors });
  } catch (error) {
    return c.json({ error: error.message }, 400);
  }
};

// 创建专业
const createMajor = async (c) => {
  try {
    const { name, college_id, description } = await c.req.json();

    const { data: major, error } = await supabaseService
      .from('majors')
      .insert({ name, college_id, description })
      .select()
      .single();

    if (error) {
      throw new Error('创建专业失败');
    }

    return c.json({ major }, 201);
  } catch (error) {
    return c.json({ error: error.message }, 400);
  }
};

// 更新专业
const updateMajor = async (c) => {
  try {
    const { id } = c.req.param();
    const { name, college_id, description } = await c.req.json();

    const { data: major, error } = await supabaseService
      .from('majors')
      .update({ name, college_id, description, updated_at: new Date() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error('更新专业失败');
    }

    return c.json({ major });
  } catch (error) {
    return c.json({ error: error.message }, 400);
  }
};

// 删除专业
const deleteMajor = async (c) => {
  try {
    const { id } = c.req.param();

    // 检查是否有关联的班级
    const { data: classes, error: classError } = await supabaseService
      .from('classes')
      .select('id')
      .eq('major_id', id);

    if (classError) {
      throw new Error('检查关联班级失败');
    }

    if (classes.length > 0) {
      throw new Error('该专业下有关联的班级，无法删除');
    }

    const { error } = await supabaseService
      .from('majors')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error('删除专业失败');
    }

    return c.json({ success: true, message: '专业删除成功' });
  } catch (error) {
    return c.json({ error: error.message }, 400);
  }
};

// 班级管理

// 获取班级列表
const getClasses = async (c) => {
  try {
    const { majorId, year } = c.req.query();

    let query = supabaseService
      .from('classes')
      .select(`
        id,
        name,
        year,
        majors(name) as major
      `);

    if (majorId) {
      query = query.eq('major_id', majorId);
    }

    if (year) {
      query = query.eq('year', year);
    }

    const { data: classes, error } = await query;

    if (error) {
      throw new Error('获取班级列表失败');
    }

    return c.json({ classes });
  } catch (error) {
    return c.json({ error: error.message }, 400);
  }
};

// 创建班级
const createClass = async (c) => {
  try {
    const { name, major_id, year } = await c.req.json();

    const { data: classObj, error } = await supabaseService
      .from('classes')
      .insert({ name, major_id, year })
      .select()
      .single();

    if (error) {
      throw new Error('创建班级失败');
    }

    return c.json({ class: classObj }, 201);
  } catch (error) {
    return c.json({ error: error.message }, 400);
  }
};

// 更新班级
const updateClass = async (c) => {
  try {
    const { id } = c.req.param();
    const { name, major_id, year } = await c.req.json();

    const { data: classObj, error } = await supabaseService
      .from('classes')
      .update({ name, major_id, year, updated_at: new Date() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error('更新班级失败');
    }

    return c.json({ class: classObj });
  } catch (error) {
    return c.json({ error: error.message }, 400);
  }
};

// 删除班级
const deleteClass = async (c) => {
  try {
    const { id } = c.req.param();

    // 检查是否有关联的学生
    const { data: students, error: studentError } = await supabaseService
      .from('user_profiles')
      .select('id')
      .eq('class_id', id);

    if (studentError) {
      throw new Error('检查关联学生失败');
    }

    if (students.length > 0) {
      throw new Error('该班级下有关联的学生，无法删除');
    }

    const { error } = await supabaseService
      .from('classes')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error('删除班级失败');
    }

    return c.json({ success: true, message: '班级删除成功' });
  } catch (error) {
    return c.json({ error: error.message }, 400);
  }
};

// 教学计划管理

// 获取教学计划
const getTeachingPlans = async (c) => {
  try {
    const { majorId } = c.req.query();

    let query = supabaseService
      .from('teaching_plans')
      .select(`
        id,
        semester,
        majors(name) as major,
        courses(
          id,
          name,
          code,
          credit,
          hours
        )
      `);

    if (majorId) {
      query = query.eq('major_id', majorId);
    }

    const { data: plans, error } = await query;

    if (error) {
      throw new Error('获取教学计划失败');
    }

    return c.json({ plans });
  } catch (error) {
    return c.json({ error: error.message }, 400);
  }
};

// 创建教学计划
const createTeachingPlan = async (c) => {
  try {
    const { major_id, course_id, semester } = await c.req.json();

    const { data: plan, error } = await supabaseService
      .from('teaching_plans')
      .insert({ major_id, course_id, semester })
      .select()
      .single();

    if (error) {
      throw new Error('创建教学计划失败');
    }

    return c.json({ plan }, 201);
  } catch (error) {
    return c.json({ error: error.message }, 400);
  }
};

// 删除教学计划
const deleteTeachingPlan = async (c) => {
  try {
    const { id } = c.req.param();

    const { error } = await supabaseService
      .from('teaching_plans')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error('删除教学计划失败');
    }

    return c.json({ success: true, message: '教学计划删除成功' });
  } catch (error) {
    return c.json({ error: error.message }, 400);
  }
};

// 培养方案管理

// 获取培养方案
const getTrainingPrograms = async (c) => {
  try {
    const { majorId } = c.req.query();

    let query = supabaseService
      .from('training_programs')
      .select(`
        id,
        name,
        description,
        credits_required,
        duration,
        majors(name) as major
      `);

    if (majorId) {
      query = query.eq('major_id', majorId);
    }

    const { data: programs, error } = await query;

    if (error) {
      throw new Error('获取培养方案失败');
    }

    return c.json({ programs });
  } catch (error) {
    return c.json({ error: error.message }, 400);
  }
};

// 创建培养方案
const createTrainingProgram = async (c) => {
  try {
    const { name, major_id, description, credits_required, duration } = await c.req.json();

    const { data: program, error } = await supabaseService
      .from('training_programs')
      .insert({ name, major_id, description, credits_required, duration })
      .select()
      .single();

    if (error) {
      throw new Error('创建培养方案失败');
    }

    return c.json({ program }, 201);
  } catch (error) {
    return c.json({ error: error.message }, 400);
  }
};

// 更新培养方案
const updateTrainingProgram = async (c) => {
  try {
    const { id } = c.req.param();
    const { name, description, credits_required, duration } = await c.req.json();

    const { data: program, error } = await supabaseService
      .from('training_programs')
      .update({ name, description, credits_required, duration, updated_at: new Date() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error('更新培养方案失败');
    }

    return c.json({ program });
  } catch (error) {
    return c.json({ error: error.message }, 400);
  }
};

// 删除培养方案
const deleteTrainingProgram = async (c) => {
  try {
    const { id } = c.req.param();

    const { error } = await supabaseService
      .from('training_programs')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error('删除培养方案失败');
    }

    return c.json({ success: true, message: '培养方案删除成功' });
  } catch (error) {
    return c.json({ error: error.message }, 400);
  }
};

// 申请管理

// 获取所有申请
const getApplications = async (c) => {
  try {
    const { type, status } = c.req.query();

    let query = supabaseService
      .from('applications')
      .select(`
        id,
        type,
        status,
        content,
        created_at,
        updated_at,
        user_profiles(name) as user
      `)
      .order('created_at', { ascending: false });

    if (type) {
      query = query.eq('type', type);
    }

    if (status) {
      query = query.eq('status', status);
    }

    const { data: applications, error } = await query;

    if (error) {
      throw new Error('获取申请列表失败');
    }

    return c.json({ applications });
  } catch (error) {
    return c.json({ error: error.message }, 400);
  }
};

// 处理申请
const processApplication = async (c) => {
  try {
    const { id } = c.req.param();
    const { status, comment } = await c.req.json();

    // 获取申请详情
    const { data: application, error: getError } = await supabaseService
      .from('applications')
      .select('*')
      .eq('id', id)
      .single();

    if (getError || !application) {
      throw new Error('申请不存在');
    }

    // 如果是开课申请且批准，创建课程
    if (status === 'approved' && application.type === 'course_creation') {
      const courseData = application.content;
      const { error: courseError } = await supabaseService
        .from('courses')
        .insert({
          name: courseData.name,
          code: courseData.code,
          credit: courseData.credit,
          hours: courseData.hours,
          college_id: courseData.college_id,
          teacher_id: application.user_id,
          semester: courseData.semester,
          year: courseData.year,
          capacity: courseData.capacity,
          status: 'available'
        });

      if (courseError) {
        throw new Error('创建课程失败');
      }
    }

    // 更新申请状态
    const { data: updatedApp, error } = await supabaseService
      .from('applications')
      .update({ 
        status, 
        updated_at: new Date(),
        content: {
          ...application.content,
          admin_comment: comment
        }
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error('处理申请失败');
    }

    return c.json({ application: updatedApp });
  } catch (error) {
    return c.json({ error: error.message }, 400);
  }
};

// 学生管理

// 获取学生列表
const getStudents = async (c) => {
  try {
    const { collegeId, majorId, classId } = c.req.query();

    let query = supabaseService
      .from('user_profiles')
      .select(`
        id,
        name,
        student_id as student_number,
        phone,
        email,
        colleges(name) as college,
        majors(name) as major,
        classes(name) as class
      `)
      .eq('role_id', 4); // 4是学生角色ID

    if (collegeId) {
      query = query.eq('college_id', collegeId);
    }

    if (majorId) {
      query = query.eq('major_id', majorId);
    }

    if (classId) {
      query = query.eq('class_id', classId);
    }

    const { data: students, error } = await query;

    if (error) {
      throw new Error('获取学生列表失败');
    }

    return c.json({ students });
  } catch (error) {
    return c.json({ error: error.message }, 400);
  }
};

// 教学评价管理

// 获取评价列表
const getEvaluations = async (c) => {
  try {
    const { courseId, teacherId } = c.req.query();

    let query = supabaseService
      .from('evaluations')
      .select(`
        id,
        score,
        comment,
        created_at,
        students:user_profiles(name, student_id as student_number),
        courses(name, code),
        teachers:user_profiles(name, teacher_id as teacher_number)
      `);

    if (courseId) {
      query = query.eq('course_id', courseId);
    }

    if (teacherId) {
      query = query.eq('teacher_id', teacherId);
    }

    const { data: evaluations, error } = await query;

    if (error) {
      throw new Error('获取评价列表失败');
    }

    return c.json({ evaluations });
  } catch (error) {
    return c.json({ error: error.message }, 400);
  }
};

// 课程管理

// 获取课程列表
const getCourses = async (c) => {
  try {
    const { collegeId, teacherId, status, semester, year } = c.req.query();

    let query = supabaseService
      .from('courses')
      .select(`
        id,
        name,
        code,
        credit,
        hours,
        semester,
        year,
        capacity,
        status,
        colleges(name) as college,
        user_profiles(name) as teacher
      `);

    if (collegeId) {
      query = query.eq('college_id', collegeId);
    }

    if (teacherId) {
      query = query.eq('teacher_id', teacherId);
    }

    if (status) {
      query = query.eq('status', status);
    }

    if (semester) {
      query = query.eq('semester', semester);
    }

    if (year) {
      query = query.eq('year', year);
    }

    const { data: courses, error } = await query;

    if (error) {
      throw new Error('获取课程列表失败');
    }

    return c.json({ courses });
  } catch (error) {
    return c.json({ error: error.message }, 400);
  }
};

// 创建课程
const createCourse = async (c) => {
  try {
    const courseData = await c.req.json();

    const { data: course, error } = await supabaseService
      .from('courses')
      .insert({
        name: courseData.name,
        code: courseData.code,
        credit: courseData.credit,
        hours: courseData.hours,
        college_id: courseData.college_id,
        teacher_id: courseData.teacher_id,
        semester: courseData.semester,
        year: courseData.year,
        capacity: courseData.capacity,
        status: courseData.status || 'available'
      })
      .select()
      .single();

    if (error) {
      throw new Error('创建课程失败');
    }

    return c.json({ course }, 201);
  } catch (error) {
    return c.json({ error: error.message }, 400);
  }
};

// 更新课程
const updateCourse = async (c) => {
  try {
    const { id } = c.req.param();
    const courseData = await c.req.json();

    const { data: course, error } = await supabaseService
      .from('courses')
      .update({
        name: courseData.name,
        code: courseData.code,
        credit: courseData.credit,
        hours: courseData.hours,
        college_id: courseData.college_id,
        teacher_id: courseData.teacher_id,
        semester: courseData.semester,
        year: courseData.year,
        capacity: courseData.capacity,
        status: courseData.status,
        updated_at: new Date()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error('更新课程失败');
    }

    return c.json({ course });
  } catch (error) {
    return c.json({ error: error.message }, 400);
  }
};

// 删除课程
const deleteCourse = async (c) => {
  try {
    const { id } = c.req.param();

    // 检查是否有学生选课
    const { data: selections, error: selectionError } = await supabaseService
      .from('course_selections')
      .select('id')
      .eq('course_id', id);

    if (selectionError) {
      throw new Error('检查课程选课情况失败');
    }

    if (selections.length > 0) {
      throw new Error('该课程已有学生选课，无法删除');
    }

    const { error } = await supabaseService
      .from('courses')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error('删除课程失败');
    }

    return c.json({ success: true, message: '课程删除成功' });
  } catch (error) {
    return c.json({ error: error.message }, 400);
  }
};

// 获取课程详情
const getCourseDetail = async (c) => {
  try {
    const { id } = c.req.param();

    const { data: course, error } = await supabaseService
      .from('courses')
      .select(`
        id,
        name,
        code,
        credit,
        hours,
        semester,
        year,
        capacity,
        status,
        colleges(name) as college,
        user_profiles(name, teacher_id as teacher_number) as teacher,
        created_at,
        updated_at
      `)
      .eq('id', id)
      .single();

    if (error || !course) {
      throw new Error('课程不存在');
    }

    return c.json({ course });
  } catch (error) {
    return c.json({ error: error.message }, 400);
  }
};

// 更新课程状态
const updateCourseStatus = async (c) => {
  try {
    const { id } = c.req.param();
    const { status } = await c.req.json();

    // 验证状态值
    const validStatuses = ['available', 'closed'];
    if (!validStatuses.includes(status)) {
      throw new Error('无效的课程状态');
    }

    const { data: course, error } = await supabaseService
      .from('courses')
      .update({ 
        status, 
        updated_at: new Date() 
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error('更新课程状态失败');
    }

    return c.json({ course });
  } catch (error) {
    return c.json({ error: error.message }, 400);
  }
};

// 考勤管理

// 获取考勤记录
const getAttendanceRecords = async (c) => {
  try {
    const { studentId, courseId, status, startDate, endDate } = c.req.query();

    let query = supabaseService
      .from('attendance')
      .select(`
        id,
        date,
        time,
        status,
        location,
        user_profiles(name, student_id as student_number) as student,
        courses(name, code) as course
      `);

    if (studentId) {
      query = query.eq('student_id', studentId);
    }

    if (courseId) {
      query = query.eq('course_id', courseId);
    }

    if (status) {
      query = query.eq('status', status);
    }

    if (startDate) {
      query = query.gte('date', startDate);
    }

    if (endDate) {
      query = query.lte('date', endDate);
    }

    const { data: records, error } = await query.order('date', { ascending: false });

    if (error) {
      throw new Error('获取考勤记录失败');
    }

    return c.json({ records });
  } catch (error) {
    return c.json({ error: error.message }, 400);
  }
};

// 更新考勤状态
const updateAttendanceStatus = async (c) => {
  try {
    const { id } = c.req.param();
    const { status } = await c.req.json();

    // 验证状态值
    const validStatuses = ['present', 'absent', 'late'];
    if (!validStatuses.includes(status)) {
      throw new Error('无效的考勤状态');
    }

    const { data: record, error } = await supabaseService
      .from('attendance')
      .update({ 
        status, 
        updated_at: new Date() 
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error('更新考勤状态失败');
    }

    return c.json({ record });
  } catch (error) {
    return c.json({ error: error.message }, 400);
  }
};

// 获取考勤统计
const getAttendanceStatistics = async (c) => {
  try {
    const { courseId, startDate, endDate } = c.req.query();

    let query = supabaseService
      .from('attendance')
      .select('status, count(*) as count')
      .group('status');

    if (courseId) {
      query = query.eq('course_id', courseId);
    }

    if (startDate) {
      query = query.gte('date', startDate);
    }

    if (endDate) {
      query = query.lte('date', endDate);
    }

    const { data: stats, error } = await query;

    if (error) {
      throw new Error('获取考勤统计失败');
    }

    // 计算总记录数和出勤率
    const total = stats.reduce((sum, item) => sum + parseInt(item.count), 0);
    const presentCount = stats.find(item => item.status === 'present')?.count || 0;
    const attendanceRate = total > 0 ? ((parseInt(presentCount) / total) * 100).toFixed(2) : '0.00';

    // 格式化统计数据
    const formattedStats = {
      total,
      attendanceRate,
      breakdown: {
        present: parseInt(stats.find(item => item.status === 'present')?.count || 0),
        absent: parseInt(stats.find(item => item.status === 'absent')?.count || 0),
        late: parseInt(stats.find(item => item.status === 'late')?.count || 0)
      }
    };

    return c.json({ stats: formattedStats });
  } catch (error) {
    return c.json({ error: error.message }, 400);
  }
};

// 获取课程考勤
const getCourseAttendance = async (c) => {
  try {
    const { courseId } = c.req.param();
    const { startDate, endDate } = c.req.query();

    let query = supabaseService
      .from('attendance')
      .select(`
        id,
        date,
        time,
        status,
        user_profiles(name, student_id as student_number) as student
      `)
      .eq('course_id', courseId);

    if (startDate) {
      query = query.gte('date', startDate);
    }

    if (endDate) {
      query = query.lte('date', endDate);
    }

    const { data: records, error } = await query.order('date', { ascending: false });

    if (error) {
      throw new Error('获取课程考勤失败');
    }

    return c.json({ records });
  } catch (error) {
    return c.json({ error: error.message }, 400);
  }
};

// 导出考勤记录
const exportAttendanceRecords = async (c) => {
  try {
    const { courseId, startDate, endDate } = c.req.query();

    let query = supabaseService
      .from('attendance')
      .select(`
        date,
        time,
        status,
        location,
        user_profiles(name, student_id as student_number) as student,
        courses(name, code) as course
      `);

    if (courseId) {
      query = query.eq('course_id', courseId);
    }

    if (startDate) {
      query = query.gte('date', startDate);
    }

    if (endDate) {
      query = query.lte('date', endDate);
    }

    const { data: records, error } = await query.order('date', { ascending: true });

    if (error) {
      throw new Error('获取考勤记录失败');
    }

    // 生成CSV格式数据
    const headers = ['日期', '时间', '学生姓名', '学号', '课程名称', '课程代码', '考勤状态', '打卡位置'];
    const csvRows = [
      headers.join(','),
      ...records.map(record => [
        record.date,
        record.time,
        record.student.name,
        record.student.student_number || '',
        record.course.name,
        record.course.code,
        record.status === 'present' ? '出勤' : record.status === 'absent' ? '缺勤' : '迟到',
        record.location || ''
      ].map(field => `"${field}"`).join(','))
    ];

    const csvContent = csvRows.join('\n');
    const fileName = `attendance_${new Date().toISOString().split('T')[0]}.csv`;

    c.header('Content-Type', 'text/csv');
    c.header('Content-Disposition', `attachment; filename="${fileName}"`);

    return c.text(csvContent);
  } catch (error) {
    return c.json({ error: error.message }, 400);
  }
};

// 统计报表功能

// 获取学生统计报表
const getStudentStatistics = async (c) => {
  try {
    const { startDate, endDate, collegeId, majorId } = c.req.query();

    // 1. 学生总数统计
    let studentQuery = supabaseService
      .from('user_profiles')
      .select('id', { count: 'exact', head: true })
      .eq('role_id', 4); // 学生角色ID

    if (collegeId) {
      studentQuery = studentQuery.eq('college_id', collegeId);
    }

    if (majorId) {
      studentQuery = studentQuery.eq('major_id', majorId);
    }

    const { count: totalStudents } = await studentQuery;

    // 2. 学生报名统计
    let enrollmentQuery = supabaseService
      .from('course_selections')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'enrolled');

    if (startDate) {
      enrollmentQuery = enrollmentQuery.gte('created_at', startDate);
    }

    if (endDate) {
      enrollmentQuery = enrollmentQuery.lte('created_at', endDate);
    }

    const { count: totalEnrollments } = await enrollmentQuery;

    // 3. 学生出勤统计
    let attendanceQuery = supabaseService
      .from('attendance')
      .select('status, count(*) as count')
      .group('status');

    if (startDate) {
      attendanceQuery = attendanceQuery.gte('date', startDate);
    }

    if (endDate) {
      attendanceQuery = attendanceQuery.lte('date', endDate);
    }

    const { data: attendanceStats } = await attendanceQuery;

    // 4. 学生缴费统计
    let paymentQuery = supabaseService
      .from('payments')
      .select('amount, status');

    if (startDate) {
      paymentQuery = paymentQuery.gte('payment_date', startDate);
    }

    if (endDate) {
      paymentQuery = paymentQuery.lte('payment_date', endDate);
    }

    const { data: payments } = await paymentQuery;

    // 5. 学生成绩统计
    let gradeQuery = supabaseService
      .from('grades')
      .select('score');

    if (startDate) {
      gradeQuery = gradeQuery.gte('created_at', startDate);
    }

    if (endDate) {
      gradeQuery = gradeQuery.lte('created_at', endDate);
    }

    const { data: grades } = await gradeQuery;

    // 计算统计数据
    const attendanceBreakdown = {
      present: 0,
      absent: 0,
      late: 0
    };

    attendanceStats.forEach(stat => {
      if (stat.status === 'present') attendanceBreakdown.present = parseInt(stat.count);
      if (stat.status === 'absent') attendanceBreakdown.absent = parseInt(stat.count);
      if (stat.status === 'late') attendanceBreakdown.late = parseInt(stat.count);
    });

    const totalAttendance = Object.values(attendanceBreakdown).reduce((sum, val) => sum + val, 0);
    const attendanceRate = totalAttendance > 0 ? ((attendanceBreakdown.present / totalAttendance) * 100).toFixed(2) : '0.00';

    let totalPayments = 0;
    let completedPayments = 0;
    payments.forEach(payment => {
      totalPayments += parseFloat(payment.amount);
      if (payment.status === 'completed') {
        completedPayments += parseFloat(payment.amount);
      }
    });

    let averageScore = 0;
    if (grades && grades.length > 0) {
      const totalScore = grades.reduce((sum, grade) => sum + parseFloat(grade.score || 0), 0);
      averageScore = (totalScore / grades.length).toFixed(2);
    }

    const statistics = {
      studentCount: totalStudents || 0,
      enrollmentCount: totalEnrollments || 0,
      attendance: {
        total: totalAttendance,
        rate: attendanceRate,
        breakdown: attendanceBreakdown
      },
      payments: {
        total: totalPayments.toFixed(2),
        completed: completedPayments.toFixed(2),
        completionRate: totalPayments > 0 ? ((completedPayments / totalPayments) * 100).toFixed(2) : '0.00'
      },
      grades: {
        average: averageScore,
        count: grades ? grades.length : 0
      }
    };

    return c.json({ statistics });
  } catch (error) {
    return c.json({ error: error.message }, 400);
  }
};

// 获取课程统计报表
const getCourseStatistics = async (c) => {
  try {
    const { startDate, endDate, collegeId, teacherId } = c.req.query();

    // 1. 课程总数统计
    let courseQuery = supabaseService
      .from('courses')
      .select('id', { count: 'exact', head: true });

    if (collegeId) {
      courseQuery = courseQuery.eq('college_id', collegeId);
    }

    if (teacherId) {
      courseQuery = courseQuery.eq('teacher_id', teacherId);
    }

    const { count: totalCourses } = await courseQuery;

    // 2. 课程参与统计
    let enrollmentQuery = supabaseService
      .from('course_selections')
      .select('course_id, count(*) as count')
      .eq('status', 'enrolled')
      .group('course_id');

    if (startDate) {
      enrollmentQuery = enrollmentQuery.gte('created_at', startDate);
    }

    if (endDate) {
      enrollmentQuery = enrollmentQuery.lte('created_at', endDate);
    }

    const { data: enrollmentStats } = await enrollmentQuery;

    // 3. 课程完成率统计
    let completionQuery = supabaseService
      .from('grades')
      .select('course_id, count(*) as count')
      .group('course_id');

    if (startDate) {
      completionQuery = completionQuery.gte('created_at', startDate);
    }

    if (endDate) {
      completionQuery = completionQuery.lte('created_at', endDate);
    }

    const { data: completionStats } = await completionQuery;

    // 4. 课程评价统计
    let evaluationQuery = supabaseService
      .from('evaluations')
      .select('course_id, avg(score) as average_score, count(*) as count')
      .group('course_id');

    if (startDate) {
      evaluationQuery = evaluationQuery.gte('created_at', startDate);
    }

    if (endDate) {
      evaluationQuery = evaluationQuery.lte('created_at', endDate);
    }

    const { data: evaluationStats } = await evaluationQuery;

    // 计算统计数据
    const courseEnrollments = {};
    enrollmentStats.forEach(stat => {
      courseEnrollments[stat.course_id] = parseInt(stat.count);
    });

    const courseCompletions = {};
    completionStats.forEach(stat => {
      courseCompletions[stat.course_id] = parseInt(stat.count);
    });

    const courseEvaluations = {};
    evaluationStats.forEach(stat => {
      courseEvaluations[stat.course_id] = {
        averageScore: parseFloat(stat.average_score).toFixed(2),
        count: parseInt(stat.count)
      };
    });

    let totalEnrollments = 0;
    let totalCompletions = 0;
    let totalEvaluationScore = 0;
    let totalEvaluations = 0;

    Object.values(courseEnrollments).forEach(count => {
      totalEnrollments += count;
    });

    Object.values(courseCompletions).forEach(count => {
      totalCompletions += count;
    });

    Object.values(courseEvaluations).forEach(evalData => {
      totalEvaluationScore += parseFloat(evalData.averageScore);
      totalEvaluations += evalData.count;
    });

    const completionRate = totalEnrollments > 0 ? ((totalCompletions / totalEnrollments) * 100).toFixed(2) : '0.00';
    const averageEvaluationScore = totalEvaluations > 0 ? (totalEvaluationScore / Object.keys(courseEvaluations).length).toFixed(2) : '0.00';

    const statistics = {
      courseCount: totalCourses || 0,
      totalEnrollments,
      totalCompletions,
      completionRate,
      averageEvaluationScore,
      enrollmentPerCourse: totalCourses > 0 ? (totalEnrollments / totalCourses).toFixed(2) : '0.00',
      evaluationCount: totalEvaluations
    };

    return c.json({ statistics });
  } catch (error) {
    return c.json({ error: error.message }, 400);
  }
};

// 获取教师统计报表
const getTeacherStatistics = async (c) => {
  try {
    const { startDate, endDate, collegeId } = c.req.query();

    // 1. 教师总数统计
    let teacherQuery = supabaseService
      .from('user_profiles')
      .select('id', { count: 'exact', head: true })
      .eq('role_id', 3); // 教师角色ID

    if (collegeId) {
      teacherQuery = teacherQuery.eq('college_id', collegeId);
    }

    const { count: totalTeachers } = await teacherQuery;

    // 2. 教师授课统计
    let courseQuery = supabaseService
      .from('courses')
      .select('teacher_id, hours');

    if (collegeId) {
      courseQuery = courseQuery.eq('college_id', collegeId);
    }

    if (startDate) {
      courseQuery = courseQuery.gte('created_at', startDate);
    }

    if (endDate) {
      courseQuery = courseQuery.lte('created_at', endDate);
    }

    const { data: courses } = await courseQuery;

    // 3. 教师评价统计
    let evaluationQuery = supabaseService
      .from('evaluations')
      .select('teacher_id, avg(score) as average_score, count(*) as count')
      .group('teacher_id');

    if (startDate) {
      evaluationQuery = evaluationQuery.gte('created_at', startDate);
    }

    if (endDate) {
      evaluationQuery = evaluationQuery.lte('created_at', endDate);
    }

    const { data: evaluationStats } = await evaluationQuery;

    // 计算统计数据
    const teachingHoursByTeacher = {};
    const courseCountByTeacher = {};

    courses.forEach(course => {
      if (!teachingHoursByTeacher[course.teacher_id]) {
        teachingHoursByTeacher[course.teacher_id] = 0;
        courseCountByTeacher[course.teacher_id] = 0;
      }
      teachingHoursByTeacher[course.teacher_id] += parseFloat(course.hours);
      courseCountByTeacher[course.teacher_id] += 1;
    });

    const evaluationByTeacher = {};

    evaluationStats.forEach(stat => {
      evaluationByTeacher[stat.teacher_id] = {
        averageScore: parseFloat(stat.average_score).toFixed(2),
        count: parseInt(stat.count)
      };
    });

    let totalTeachingHours = 0;
    let totalCourses = 0;
    let totalEvaluationScore = 0;
    let totalEvaluations = 0;

    Object.values(teachingHoursByTeacher).forEach(hours => {
      totalTeachingHours += hours;
    });

    Object.values(courseCountByTeacher).forEach(count => {
      totalCourses += count;
    });

    Object.values(evaluationByTeacher).forEach(evalData => {
      totalEvaluationScore += parseFloat(evalData.averageScore);
      totalEvaluations += evalData.count;
    });

    const averageTeachingHours = totalTeachers > 0 ? (totalTeachingHours / totalTeachers).toFixed(2) : '0.00';
    const averageCoursesPerTeacher = totalTeachers > 0 ? (totalCourses / totalTeachers).toFixed(2) : '0.00';
    const averageEvaluationScore = totalTeachers > 0 ? (totalEvaluationScore / Object.keys(evaluationByTeacher).length).toFixed(2) : '0.00';

    const statistics = {
      teacherCount: totalTeachers || 0,
      totalTeachingHours: totalTeachingHours.toFixed(2),
      totalCourses,
      totalEvaluations,
      averageTeachingHours,
      averageCoursesPerTeacher,
      averageEvaluationScore
    };

    return c.json({ statistics });
  } catch (error) {
    return c.json({ error: error.message }, 400);
  }
};

// 导出统计报表
const exportStatisticsReport = async (c) => {
  try {
    const { reportType, startDate, endDate } = c.req.query();

    let data, headers, fileName;

    switch (reportType) {
      case 'student':
        // 获取学生统计数据
        const studentStats = await getStudentStatistics(c);
        data = studentStats._body.data.statistics;
        headers = ['统计项', '数值'];
        fileName = `student_statistics_${new Date().toISOString().split('T')[0]}.csv`;
        break;
      case 'course':
        // 获取课程统计数据
        const courseStats = await getCourseStatistics(c);
        data = courseStats._body.data.statistics;
        headers = ['统计项', '数值'];
        fileName = `course_statistics_${new Date().toISOString().split('T')[0]}.csv`;
        break;
      case 'teacher':
        // 获取教师统计数据
        const teacherStats = await getTeacherStatistics(c);
        data = teacherStats._body.data.statistics;
        headers = ['统计项', '数值'];
        fileName = `teacher_statistics_${new Date().toISOString().split('T')[0]}.csv`;
        break;
      default:
        throw new Error('无效的报表类型');
    }

    // 生成CSV数据
    const csvRows = [
      headers.join(','),
      ...Object.entries(data).map(([key, value]) => {
        if (typeof value === 'object') {
          return Object.entries(value).map(([subKey, subValue]) => 
            [`${key}_${subKey}`, subValue].map(field => `"${field}"`).join(',')
          );
        }
        return [key, value].map(field => `"${field}"`).join(',');
      }).flat()
    ];

    const csvContent = csvRows.join('\n');

    c.header('Content-Type', 'text/csv');
    c.header('Content-Disposition', `attachment; filename="${fileName}"`);

    return c.text(csvContent);
  } catch (error) {
    return c.json({ error: error.message }, 400);
  }
};

export default {
  // 学院管理
  getColleges,
  createCollege,
  updateCollege,
  deleteCollege,
  
  // 专业管理
  getMajors,
  createMajor,
  updateMajor,
  deleteMajor,
  
  // 班级管理
  getClasses,
  createClass,
  updateClass,
  deleteClass,
  
  // 教学计划管理
  getTeachingPlans,
  createTeachingPlan,
  deleteTeachingPlan,
  
  // 培养方案管理
  getTrainingPrograms,
  createTrainingProgram,
  updateTrainingProgram,
  deleteTrainingProgram,
  
  // 申请管理
  getApplications,
  processApplication,
  
  // 学生管理
  getStudents,
  
  // 评价管理
  getEvaluations,
  
  // 课程管理
  getCourses,
  createCourse,
  updateCourse,
  deleteCourse,
  getCourseDetail,
  updateCourseStatus,
  
  // 考勤管理
  getAttendanceRecords,
  updateAttendanceStatus,
  getAttendanceStatistics,
  getCourseAttendance,
  exportAttendanceRecords,
  
  // 统计报表管理
  getStudentStatistics,
  getCourseStatistics,
  getTeacherStatistics,
  exportStatisticsReport
};
