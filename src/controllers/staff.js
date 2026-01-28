const { supabaseService } = require('../services/supabase');

// 学院管理

// 获取学院列表
const getColleges = async (req, res) => {
  try {
    const { data: colleges, error } = await supabaseService
      .from('colleges')
      .select('*');

    if (error) {
      throw new Error('获取学院列表失败');
    }

    res.status(200).json({ colleges });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// 创建学院
const createCollege = async (req, res) => {
  try {
    const { name, description } = req.body;

    const { data: college, error } = await supabaseService
      .from('colleges')
      .insert({ name, description })
      .select()
      .single();

    if (error) {
      throw new Error('创建学院失败');
    }

    res.status(201).json({ college });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// 更新学院
const updateCollege = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    const { data: college, error } = await supabaseService
      .from('colleges')
      .update({ name, description, updated_at: new Date() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error('更新学院失败');
    }

    res.status(200).json({ college });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// 删除学院
const deleteCollege = async (req, res) => {
  try {
    const { id } = req.params;

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

    res.status(200).json({ success: true, message: '学院删除成功' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// 专业管理

// 获取专业列表
const getMajors = async (req, res) => {
  try {
    const { collegeId } = req.query;

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

    res.status(200).json({ majors });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// 创建专业
const createMajor = async (req, res) => {
  try {
    const { name, college_id, description } = req.body;

    const { data: major, error } = await supabaseService
      .from('majors')
      .insert({ name, college_id, description })
      .select()
      .single();

    if (error) {
      throw new Error('创建专业失败');
    }

    res.status(201).json({ major });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// 更新专业
const updateMajor = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, college_id, description } = req.body;

    const { data: major, error } = await supabaseService
      .from('majors')
      .update({ name, college_id, description, updated_at: new Date() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error('更新专业失败');
    }

    res.status(200).json({ major });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// 删除专业
const deleteMajor = async (req, res) => {
  try {
    const { id } = req.params;

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

    res.status(200).json({ success: true, message: '专业删除成功' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// 班级管理

// 获取班级列表
const getClasses = async (req, res) => {
  try {
    const { majorId, year } = req.query;

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

    res.status(200).json({ classes });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// 创建班级
const createClass = async (req, res) => {
  try {
    const { name, major_id, year } = req.body;

    const { data: classObj, error } = await supabaseService
      .from('classes')
      .insert({ name, major_id, year })
      .select()
      .single();

    if (error) {
      throw new Error('创建班级失败');
    }

    res.status(201).json({ class: classObj });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// 更新班级
const updateClass = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, major_id, year } = req.body;

    const { data: classObj, error } = await supabaseService
      .from('classes')
      .update({ name, major_id, year, updated_at: new Date() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error('更新班级失败');
    }

    res.status(200).json({ class: classObj });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// 删除班级
const deleteClass = async (req, res) => {
  try {
    const { id } = req.params;

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

    res.status(200).json({ success: true, message: '班级删除成功' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// 教学计划管理

// 获取教学计划
const getTeachingPlans = async (req, res) => {
  try {
    const { majorId } = req.query;

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

    res.status(200).json({ plans });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// 创建教学计划
const createTeachingPlan = async (req, res) => {
  try {
    const { major_id, course_id, semester } = req.body;

    const { data: plan, error } = await supabaseService
      .from('teaching_plans')
      .insert({ major_id, course_id, semester })
      .select()
      .single();

    if (error) {
      throw new Error('创建教学计划失败');
    }

    res.status(201).json({ plan });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// 删除教学计划
const deleteTeachingPlan = async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabaseService
      .from('teaching_plans')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error('删除教学计划失败');
    }

    res.status(200).json({ success: true, message: '教学计划删除成功' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// 培养方案管理

// 获取培养方案
const getTrainingPrograms = async (req, res) => {
  try {
    const { majorId } = req.query;

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

    res.status(200).json({ programs });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// 创建培养方案
const createTrainingProgram = async (req, res) => {
  try {
    const { name, major_id, description, credits_required, duration } = req.body;

    const { data: program, error } = await supabaseService
      .from('training_programs')
      .insert({ name, major_id, description, credits_required, duration })
      .select()
      .single();

    if (error) {
      throw new Error('创建培养方案失败');
    }

    res.status(201).json({ program });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// 更新培养方案
const updateTrainingProgram = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, credits_required, duration } = req.body;

    const { data: program, error } = await supabaseService
      .from('training_programs')
      .update({ name, description, credits_required, duration, updated_at: new Date() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error('更新培养方案失败');
    }

    res.status(200).json({ program });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// 删除培养方案
const deleteTrainingProgram = async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabaseService
      .from('training_programs')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error('删除培养方案失败');
    }

    res.status(200).json({ success: true, message: '培养方案删除成功' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// 申请管理

// 获取所有申请
const getApplications = async (req, res) => {
  try {
    const { type, status } = req.query;

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

    res.status(200).json({ applications });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// 处理申请
const processApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, comment } = req.body;

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

    res.status(200).json({ application: updatedApp });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// 学生管理

// 获取学生列表
const getStudents = async (req, res) => {
  try {
    const { collegeId, majorId, classId } = req.query;

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

    res.status(200).json({ students });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// 教学评价管理

// 获取评价列表
const getEvaluations = async (req, res) => {
  try {
    const { courseId, teacherId } = req.query;

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

    res.status(200).json({ evaluations });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
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
