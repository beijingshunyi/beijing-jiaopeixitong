import { supabaseService } from '../services/supabase.js';

// 获取教师教授的课程
const getMyCourses = async (c) => {
  try {
    const teacherId = c.get('userProfile').id;

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
        status
      `)
      .eq('teacher_id', teacherId);

    if (error) {
      throw new Error('获取课程列表失败');
    }

    return c.json({ courses });
  } catch (error) {
    return c.json({ error: error.message }, 400);
  }
};

// 获取课程的学生列表
const getCourseStudents = async (c) => {
  try {
    const teacherId = c.get('userProfile').id;
    const { courseId } = c.req.param();

    // 验证课程是否属于该教师
    const { data: course, error: courseError } = await supabaseService
      .from('courses')
      .select('id')
      .eq('id', courseId)
      .eq('teacher_id', teacherId)
      .single();

    if (courseError || !course) {
      throw new Error('课程不存在或无权限');
    }

    // 获取选课学生列表
    const { data: students, error } = await supabaseService
      .from('course_selections')
      .select(`
        student_id,
        user_profiles(
          name,
          student_id as student_number
        ),
        status
      `)
      .eq('course_id', courseId)
      .eq('status', 'enrolled');

    if (error) {
      throw new Error('获取学生列表失败');
    }

    return c.json({ 
      students: students.map(item => ({
        id: item.student_id,
        name: item.user_profiles.name,
        studentNumber: item.user_profiles.student_number
      })) 
    });
  } catch (error) {
    return c.json({ error: error.message }, 400);
  }
};

// 录入学生成绩
const enterGrades = async (c) => {
  try {
    const teacherId = c.get('userProfile').id;
    const { courseId, grades } = await c.req.json();

    // 验证课程是否属于该教师
    const { data: course, error: courseError } = await supabaseService
      .from('courses')
      .select('id')
      .eq('id', courseId)
      .eq('teacher_id', teacherId)
      .single();

    if (courseError || !course) {
      throw new Error('课程不存在或无权限');
    }

    // 批量录入成绩
    const gradePromises = grades.map(async (gradeItem) => {
      // 检查是否已存在成绩记录
      const { data: existingGrade, error: existingError } = await supabaseService
        .from('grades')
        .select('id')
        .eq('student_id', gradeItem.studentId)
        .eq('course_id', courseId)
        .single();

      if (existingError && existingError.code !== 'PGRST116') { // PGRST116表示未找到记录
        throw new Error(`检查成绩记录失败: ${existingError.message}`);
      }

      // 计算等级
      let gradeLevel;
      if (gradeItem.score >= 90) gradeLevel = 'A';
      else if (gradeItem.score >= 80) gradeLevel = 'B';
      else if (gradeItem.score >= 70) gradeLevel = 'C';
      else if (gradeItem.score >= 60) gradeLevel = 'D';
      else gradeLevel = 'F';

      if (existingGrade) {
        // 更新现有成绩
        const { data: updatedGrade, error: updateError } = await supabaseService
          .from('grades')
          .update({
            score: gradeItem.score,
            grade: gradeLevel,
            updated_at: new Date()
          })
          .eq('id', existingGrade.id)
          .select()
          .single();

        if (updateError) {
          throw new Error(`更新成绩失败: ${updateError.message}`);
        }

        return updatedGrade;
      } else {
        // 创建新成绩记录
        const { data: newGrade, error: insertError } = await supabaseService
          .from('grades')
          .insert({
            student_id: gradeItem.studentId,
            course_id: courseId,
            score: gradeItem.score,
            grade: gradeLevel,
            teacher_id: teacherId
          })
          .select()
          .single();

        if (insertError) {
          throw new Error(`录入成绩失败: ${insertError.message}`);
        }

        return newGrade;
      }
    });

    const results = await Promise.all(gradePromises);
    return c.json({ success: true, grades: results });
  } catch (error) {
    return c.json({ error: error.message }, 400);
  }
};

// 获取课程评价
const getCourseEvaluations = async (c) => {
  try {
    const teacherId = c.get('userProfile').id;
    const { courseId } = c.req.param();

    // 验证课程是否属于该教师
    const { data: course, error: courseError } = await supabaseService
      .from('courses')
      .select('id')
      .eq('id', courseId)
      .eq('teacher_id', teacherId)
      .single();

    if (courseError || !course) {
      throw new Error('课程不存在或无权限');
    }

    // 获取评价列表
    const { data: evaluations, error } = await supabaseService
      .from('evaluations')
      .select(`
        id,
        score,
        comment,
        student_id,
        user_profiles(
          name
        ),
        created_at
      `)
      .eq('course_id', courseId);

    if (error) {
      throw new Error('获取评价列表失败');
    }

    // 计算平均评分
    const averageScore = evaluations.length > 0 
      ? evaluations.reduce((sum, evalItem) => sum + evalItem.score, 0) / evaluations.length 
      : 0;

    return c.json({ 
      evaluations,
      averageScore 
    });
  } catch (error) {
    return c.json({ error: error.message }, 400);
  }
};

// 获取个人课表
const getMySchedule = async (c) => {
  try {
    const teacherId = c.get('userProfile').id;
    const { semester, year } = c.req.query();

    if (!semester || !year) {
      throw new Error('请指定学期和年份');
    }

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
        capacity
      `)
      .eq('teacher_id', teacherId)
      .eq('semester', semester)
      .eq('year', year);

    if (error) {
      throw new Error('获取课表失败');
    }

    return c.json({ courses });
  } catch (error) {
    return c.json({ error: error.message }, 400);
  }
};

// 获取成绩统计
const getGradeStatistics = async (c) => {
  try {
    const teacherId = c.get('userProfile').id;
    const { courseId } = c.req.param();

    // 验证课程是否属于该教师
    const { data: course, error: courseError } = await supabaseService
      .from('courses')
      .select('id')
      .eq('id', courseId)
      .eq('teacher_id', teacherId)
      .single();

    if (courseError || !course) {
      throw new Error('课程不存在或无权限');
    }

    // 获取成绩统计
    const { data: grades, error } = await supabaseService
      .from('grades')
      .select('score, grade')
      .eq('course_id', courseId);

    if (error) {
      throw new Error('获取成绩统计失败');
    }

    // 计算统计数据
    if (grades.length === 0) {
      return c.json({ 
        averageScore: 0,
        highestScore: 0,
        lowestScore: 0,
        gradeDistribution: {},
        totalStudents: 0
      });
    }

    const scores = grades.map(g => g.score);
    const averageScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    const highestScore = Math.max(...scores);
    const lowestScore = Math.min(...scores);

    // 计算等级分布
    const gradeDistribution = grades.reduce((acc, g) => {
      acc[g.grade] = (acc[g.grade] || 0) + 1;
      return acc;
    }, {});

    return c.json({ 
      averageScore,
      highestScore,
      lowestScore,
      gradeDistribution,
      totalStudents: grades.length
    });
  } catch (error) {
    return c.json({ error: error.message }, 400);
  }
};

// 更新个人信息
const updateProfile = async (c) => {
  try {
    const teacherId = c.get('userProfile').id;
    const updateData = await c.req.json();

    const { data: updatedProfile, error } = await supabaseService
      .from('user_profiles')
      .update(updateData)
      .eq('id', teacherId)
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

// 申请开课
const applyForCourse = async (c) => {
  try {
    const teacherId = c.get('userProfile').id;
    const courseData = await c.req.json();

    // 创建开课申请
    const { data: application, error } = await supabaseService
      .from('applications')
      .insert({
        user_id: teacherId,
        type: 'course_creation',
        status: 'pending',
        content: courseData
      })
      .select()
      .single();

    if (error) {
      throw new Error('提交申请失败');
    }

    return c.json({ success: true, application });
  } catch (error) {
    return c.json({ error: error.message }, 400);
  }
};

// 获取我的申请记录
const getMyApplications = async (c) => {
  try {
    const teacherId = c.get('userProfile').id;

    const { data: applications, error } = await supabaseService
      .from('applications')
      .select('*')
      .eq('user_id', teacherId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error('获取申请记录失败');
    }

    return c.json({ applications });
  } catch (error) {
    return c.json({ error: error.message }, 400);
  }
};

export default {
  getMyCourses,
  getCourseStudents,
  enterGrades,
  getCourseEvaluations,
  getMySchedule,
  getGradeStatistics,
  updateProfile,
  applyForCourse,
  getMyApplications
};
