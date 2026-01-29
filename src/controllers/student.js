import { supabaseService } from '../services/supabase.js';

// 首页统计
const getDashboard = async (c) => {
  try {
    const studentId = c.get('userProfile').id;

    // 1. 获取已选课程数量
    const { data: courseCount, error: courseError } = await supabaseService
      .from('course_selections')
      .select('id')
      .eq('student_id', studentId)
      .eq('status', 'enrolled');

    // 2. 获取已完成课程数量
    const { data: completedCourses, error: completedError } = await supabaseService
      .from('grades')
      .select('id')
      .eq('student_id', studentId);

    // 3. 获取平均成绩
    const { data: gradeRecords, error: gradeError } = await supabaseService
      .from('grades')
      .select('score')
      .eq('student_id', studentId);

    if (courseError || completedError || gradeError) {
      throw new Error('获取统计数据失败');
    }

    // 计算平均成绩
    const averageScore = gradeRecords && gradeRecords.length > 0
      ? gradeRecords.reduce((sum, record) => sum + (record.score || 0), 0) / gradeRecords.length
      : 0;

    return c.json({
      enrolledCourses: courseCount.length,
      completedCourses: completedCourses.length,
      averageScore: averageScore.toFixed(2)
    });
  } catch (error) {
    return c.json({ error: error.message }, 400);
  }
};

// 获取可选课程列表
const getAvailableCourses = async (c) => {
  try {
    // 获取当前学期的可用课程
    const { data: courses, error } = await supabaseService
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
        user_profiles(name) as teacher
      `)
      .eq('status', 'available');

    if (error) {
      throw new Error('获取课程列表失败');
    }

    return c.json({ courses });
  } catch (error) {
    return c.json({ error: error.message }, 400);
  }
};

// 选课
const enrollCourse = async (c) => {
  try {
    const studentId = c.get('userProfile').id;
    const { courseId } = await c.req.json();

    // 1. 检查课程是否存在且可用
    const { data: course, error: courseError } = await supabaseService
      .from('courses')
      .select('id, capacity, status')
      .eq('id', courseId)
      .single();

    if (courseError || !course || course.status !== 'available') {
      throw new Error('课程不存在或已关闭');
    }

    // 2. 检查是否已选该课程
    const { data: existingSelection, error: selectionError } = await supabaseService
      .from('course_selections')
      .select('id')
      .eq('student_id', studentId)
      .eq('course_id', courseId)
      .maybeSingle();

    if (existingSelection) {
      throw new Error('已选该课程');
    }

    // 3. 检查课程容量
    const { data: currentEnrollments, error: enrollmentError } = await supabaseService
      .from('course_selections')
      .select('id')
      .eq('course_id', courseId)
      .eq('status', 'enrolled');

    if (enrollmentError) {
      throw new Error('检查课程容量失败');
    }

    if (currentEnrollments && currentEnrollments.length >= course.capacity) {
      throw new Error('课程已达到最大容量');
    }

    // 4. 执行选课（初始化剩余课时为课程总课时）
    const { data: courseInfo, error: courseInfoError } = await supabaseService
      .from('courses')
      .select('hours')
      .eq('id', courseId)
      .single();

    if (courseInfoError) {
      throw new Error('获取课程信息失败');
    }

    const { data: newSelection, error: newSelectionError } = await supabaseService
      .from('course_selections')
      .insert({
        student_id: studentId,
        course_id: courseId,
        status: 'enrolled',
        remaining_hours: courseInfo.hours
      })
      .select()
      .single();

    if (newSelectionError) {
      throw new Error('选课失败');
    }

    return c.json({ success: true, selection: newSelection });
  } catch (error) {
    return c.json({ error: error.message }, 400);
  }
};

// 退课
const dropCourse = async (c) => {
  try {
    const studentId = c.get('userProfile').id;
    const { courseId } = await c.req.json();

    // 执行退课
    const { data: updatedSelection, error } = await supabaseService
      .from('course_selections')
      .update({ status: 'dropped' })
      .eq('student_id', studentId)
      .eq('course_id', courseId)
      .eq('status', 'enrolled')
      .select()
      .single();

    if (error || !updatedSelection) {
      throw new Error('退课失败或未选该课程');
    }

    return c.json({ success: true, selection: updatedSelection });
  } catch (error) {
    return c.json({ error: error.message }, 400);
  }
};

// 获取已选课程
const getEnrolledCourses = async (c) => {
  try {
    const studentId = c.get('userProfile').id;

    const { data: courses, error } = await supabaseService
      .from('course_selections')
      .select(`
        courses(
          id,
          name,
          code,
          credit,
          hours,
          semester,
          year,
          user_profiles(name) as teacher
        ),
        status,
        created_at
      `)
      .eq('student_id', studentId)
      .eq('status', 'enrolled');

    if (error) {
      throw new Error('获取课程列表失败');
    }

    return c.json({ courses: courses.map(item => item.courses) });
  } catch (error) {
    return c.json({ error: error.message }, 400);
  }
};

// 查询成绩
const getGrades = async (c) => {
  try {
    const studentId = c.get('userProfile').id;

    const { data: grades, error } = await supabaseService
      .from('grades')
      .select(`
        id,
        score,
        grade,
        courses(
          name,
          code,
          credit,
          semester,
          year
        ),
        created_at
      `)
      .eq('student_id', studentId);

    if (error) {
      throw new Error('获取成绩失败');
    }

    return c.json({ grades });
  } catch (error) {
    return c.json({ error: error.message }, 400);
  }
};

// 获取个人课表
const getSchedule = async (c) => {
  try {
    const studentId = c.get('userProfile').id;
    const { semester, year } = c.req.query();

    if (!semester || !year) {
      throw new Error('请指定学期和年份');
    }

    const { data: courses, error } = await supabaseService
      .from('course_selections')
      .select(`
        courses(
          id,
          name,
          code,
          hours,
          semester,
          year,
          user_profiles(name) as teacher
        )
      `)
      .eq('student_id', studentId)
      .eq('status', 'enrolled')
      .eq('courses.semester', semester)
      .eq('courses.year', year);

    if (error) {
      throw new Error('获取课表失败');
    }

    return c.json({ courses: courses.map(item => item.courses) });
  } catch (error) {
    return c.json({ error: error.message }, 400);
  }
};

// 提交课程评价
const submitEvaluation = async (c) => {
  try {
    const studentId = c.get('userProfile').id;
    const { courseId, score, comment } = await c.req.json();

    // 1. 检查是否已选该课程
    const { data: selection, error: selectionError } = await supabaseService
      .from('course_selections')
      .select('id')
      .eq('student_id', studentId)
      .eq('course_id', courseId)
      .single();

    if (selectionError || !selection) {
      throw new Error('未选该课程');
    }

    // 2. 检查是否已评价
    const { data: existingEval, error: evalError } = await supabaseService
      .from('evaluations')
      .select('id')
      .eq('student_id', studentId)
      .eq('course_id', courseId)
      .maybeSingle();

    if (existingEval) {
      throw new Error('已评价该课程');
    }

    // 3. 获取课程信息（教师ID）
    const { data: course, error: courseError } = await supabaseService
      .from('courses')
      .select('teacher_id')
      .eq('id', courseId)
      .single();

    if (courseError || !course) {
      throw new Error('课程不存在');
    }

    // 4. 提交评价
    const { data: evaluation, error: submitError } = await supabaseService
      .from('evaluations')
      .insert({
        student_id: studentId,
        course_id: courseId,
        teacher_id: course.teacher_id,
        score,
        comment
      })
      .select()
      .single();

    if (submitError) {
      throw new Error('提交评价失败');
    }

    return c.json({ success: true, evaluation });
  } catch (error) {
    return c.json({ error: error.message }, 400);
  }
};

// 获取教学计划
const getTeachingPlan = async (c) => {
  try {
    const majorId = c.get('userProfile').major_id;

    if (!majorId) {
      throw new Error('未关联专业');
    }

    const { data: plan, error } = await supabaseService
      .from('teaching_plans')
      .select(`
        semester,
        courses(
          id,
          name,
          code,
          credit,
          hours
        )
      `)
      .eq('major_id', majorId);

    if (error) {
      throw new Error('获取教学计划失败');
    }

    return c.json({ plan });
  } catch (error) {
    return c.json({ error: error.message }, 400);
  }
};

// 获取培养方案
const getTrainingProgram = async (c) => {
  try {
    const majorId = c.get('userProfile').major_id;

    if (!majorId) {
      throw new Error('未关联专业');
    }

    const { data: program, error } = await supabaseService
      .from('training_programs')
      .select('*')
      .eq('major_id', majorId)
      .single();

    if (error || !program) {
      throw new Error('获取培养方案失败');
    }

    return c.json({ program });
  } catch (error) {
    return c.json({ error: error.message }, 400);
  }
};

// 更新个人信息
const updateProfile = async (c) => {
  try {
    const userId = c.get('userProfile').id;
    const updateData = await c.req.json();

    const { data: updatedProfile, error } = await supabaseService
      .from('user_profiles')
      .update(updateData)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      throw new Error('更新个人信息失败');
    }

    return c.json({ success: true, user: updatedProfile });
  } catch (error) {
    return c.json({ error: error.message }, 400);
  }
};

// 修改密码
const changePassword = async (c) => {
  try {
    const userId = c.get('userProfile').id;
    const { newPassword } = await c.req.json();

    const { error } = await supabaseService.auth.admin.updateUserById(userId, {
      password: newPassword
    });

    if (error) {
      throw new Error('修改密码失败');
    }

    return c.json({ success: true, message: '密码修改成功' });
  } catch (error) {
    return c.json({ error: error.message }, 400);
  }
};

// 打卡功能
const checkIn = async (c) => {
  try {
    const studentId = c.get('userProfile').id;
    const { courseId, location, deviceInfo } = await c.req.json();

    // 1. 验证课程是否存在且学生已报名
    const { data: courseSelection, error: selectionError } = await supabaseService
      .from('course_selections')
      .select('id, remaining_hours, course_id')
      .eq('student_id', studentId)
      .eq('course_id', courseId)
      .eq('status', 'enrolled')
      .single();

    if (selectionError || !courseSelection) {
      throw new Error('未报名该课程');
    }

    // 获取课程信息
    const { data: course, error: courseError } = await supabaseService
      .from('courses')
      .select('id, name, hours')
      .eq('id', courseId)
      .single();

    if (courseError || !course) {
      throw new Error('课程不存在');
    }

    // 2. 检查今天是否已经打卡
    const today = new Date().toISOString().split('T')[0];
    const { data: existingCheckIn, error: checkInError } = await supabaseService
      .from('attendance')
      .select('id')
      .eq('student_id', studentId)
      .eq('course_id', courseId)
      .eq('date', today)
      .maybeSingle();

    if (existingCheckIn) {
      throw new Error('今日已打卡');
    }

    // 3. 执行打卡
    const { data: checkInRecord, error: createError } = await supabaseService
      .from('attendance')
      .insert({
        student_id: studentId,
        course_id: courseId,
        date: today,
        time: new Date().toISOString(),
        status: 'present',
        location,
        device_info: deviceInfo
      })
      .select()
      .single();

    if (createError) {
      throw new Error('打卡失败');
    }

    // 4. 扣除课时（简化版：每次打卡扣除1课时）
    const currentRemainingHours = courseSelection.remaining_hours !== null
      ? courseSelection.remaining_hours
      : course.hours;

    const newRemainingHours = Math.max(0, currentRemainingHours - 1);

    const { error: updateError } = await supabaseService
      .from('course_selections')
      .update({
        remaining_hours: newRemainingHours
      })
      .eq('id', courseSelection.id);

    if (updateError) {
      console.error('扣除课时失败:', updateError);
      // 课时扣除失败不影响打卡结果
    }

    return c.json({ 
      success: true, 
      message: '打卡成功',
      checkIn: checkInRecord
    });
  } catch (error) {
    return c.json({ error: error.message }, 400);
  }
};

// 获取打卡记录
const getAttendanceRecords = async (c) => {
  try {
    const studentId = c.get('userProfile').id;
    const { courseId, startDate, endDate } = c.req.query();

    let query = supabaseService
      .from('attendance')
      .select(`
        id,
        date,
        time,
        status,
        location,
        courses(name, code)
      `)
      .eq('student_id', studentId);

    if (courseId) {
      query = query.eq('course_id', courseId);
    }

    if (startDate) {
      query = query.gte('date', startDate);
    }

    if (endDate) {
      query = query.lte('date', endDate);
    }

    const { data: records, error } = await query.order('date', { ascending: false });

    if (error) {
      throw new Error('获取打卡记录失败');
    }

    return c.json({ records });
  } catch (error) {
    return c.json({ error: error.message }, 400);
  }
};

// 获取课时剩余情况
const getRemainingHours = async (c) => {
  try {
    const studentId = c.get('userProfile').id;

    const { data: courses, error } = await supabaseService
      .from('course_selections')
      .select(`
        id,
        remaining_hours,
        courses(
          name,
          code,
          hours
        )
      `)
      .eq('student_id', studentId)
      .eq('status', 'enrolled');

    if (error) {
      throw new Error('获取课时信息失败');
    }

    const courseHours = courses.map(course => ({
      id: course.id,
      name: course.courses.name,
      code: course.courses.code,
      totalHours: course.courses.hours,
      remainingHours: course.remaining_hours !== null ? course.remaining_hours : course.courses.hours
    }));

    return c.json({ courses: courseHours });
  } catch (error) {
    return c.json({ error: error.message }, 400);
  }
};

export default {
  getDashboard,
  getAvailableCourses,
  enrollCourse,
  dropCourse,
  getEnrolledCourses,
  getGrades,
  getSchedule,
  submitEvaluation,
  getTeachingPlan,
  getTrainingProgram,
  updateProfile,
  changePassword,
  checkIn,
  getAttendanceRecords,
  getRemainingHours
};
