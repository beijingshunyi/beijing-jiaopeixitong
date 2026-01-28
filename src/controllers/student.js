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
    const { data: avgGrade, error: gradeError } = await supabaseService
      .from('grades')
      .select('AVG(score) as average')
      .eq('student_id', studentId)
      .single();

    if (courseError || completedError || gradeError) {
      throw new Error('获取统计数据失败');
    }

    return c.json({
      enrolledCourses: courseCount.length,
      completedCourses: completedCourses.length,
      averageScore: avgGrade.average || 0
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
      .single();

    if (existingSelection) {
      throw new Error('已选该课程');
    }

    // 3. 检查课程容量
    const { data: currentEnrollments, error: enrollmentError } = await supabaseService
      .from('course_selections')
      .select('id')
      .eq('course_id', courseId)
      .eq('status', 'enrolled');

    if (currentEnrollments.length >= course.capacity) {
      throw new Error('课程已达到最大容量');
    }

    // 4. 执行选课
    const { data: newSelection, error: newSelectionError } = await supabaseService
      .from('course_selections')
      .insert({
        student_id: studentId,
        course_id: courseId,
        status: 'enrolled'
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
      .single();

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
  changePassword
};
