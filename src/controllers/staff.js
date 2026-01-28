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
  getEvaluations
};
