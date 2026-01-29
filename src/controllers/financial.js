import { supabaseService } from '../services/supabase.js';

// 获取财务统计数据
const getFinancialStats = async (c) => {
  try {
    const { startDate, endDate } = c.req.query();

    let query = supabaseService
      .from('financial_records')
      .select('*');

    if (startDate) {
      query = query.gte('created_at', startDate);
    }

    if (endDate) {
      query = query.lte('created_at', endDate);
    }

    const { data: records, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;

    // 计算统计数据
    const stats = {
      totalIncome: 0,
      totalExpense: 0,
      netProfit: 0,
      incomeByCategory: {},
      expenseByCategory: {},
      recentTransactions: records.slice(0, 10)
    };

    records.forEach(record => {
      if (record.type === 'income') {
        stats.totalIncome += parseFloat(record.amount);
        stats.incomeByCategory[record.category] =
          (stats.incomeByCategory[record.category] || 0) + parseFloat(record.amount);
      } else {
        stats.totalExpense += parseFloat(record.amount);
        stats.expenseByCategory[record.category] =
          (stats.expenseByCategory[record.category] || 0) + parseFloat(record.amount);
      }
    });

    stats.netProfit = stats.totalIncome - stats.totalExpense;

    return c.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('获取财务统计失败:', error);
    return c.json({
      success: false,
      message: '获取财务统计失败',
      error: error.message
    }, 500);
  }
};

// 获取月度财务统计
const getMonthlyStats = async (c) => {
  try {
    const { year, month } = c.req.param();

    const { data: summaries, error } = await supabaseService
      .from('financial_summaries')
      .select('*')
      .eq('year', parseInt(year))
      .eq('month', parseInt(month))
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    return c.json({
      success: true,
      data: summaries || {
        year: parseInt(year),
        month: parseInt(month),
        total_income: 0,
        total_expense: 0,
        net_profit: 0,
        student_count: 0,
        course_count: 0
      }
    });
  } catch (error) {
    console.error('获取月度统计失败:', error);
    return c.json({
      success: false,
      message: '获取月度统计失败',
      error: error.message
    }, 500);
  }
};

// 创建缴费记录
const createPayment = async (c) => {
  try {
    const { student_id, course_id, amount, payment_type, payment_method, notes } = await c.req.json();
    const userId = c.get('userProfile').id;

    // 生成收据号
    const receipt_number = `REC${Date.now()}${Math.floor(Math.random() * 1000)}`;

    const { data: payment, error } = await supabaseService
      .from('payments')
      .insert({
        student_id,
        course_id,
        amount,
        payment_type,
        payment_method,
        receipt_number,
        notes,
        created_by: userId
      })
      .select()
      .single();

    if (error) throw error;

    // 创建财务记录
    await supabaseService.from('financial_records').insert({
      type: 'income',
      category: payment_type,
      amount,
      description: `缴费: ${payment_type}`,
      reference_id: student_id,
      reference_type: 'user',
      payment_method,
      status: 'completed',
      created_by: userId
    });

    // 更新月度统计
    await updateMonthlySummary();

    return c.json({
      success: true,
      message: '缴费记录创建成功',
      data: payment
    });
  } catch (error) {
    console.error('创建缴费记录失败:', error);
    return c.json({
      success: false,
      message: '创建缴费记录失败',
      error: error.message
    }, 500);
  }
};

// 获取缴费记录列表
const getPayments = async (c) => {
  try {
    const { student_id, course_id, status, start_date, end_date, page = 1, limit = 20 } = c.req.query();

    let query = supabaseService
      .from('payments')
      .select(`
        *,
        student:student_id(id, name, student_id),
        course:course_id(id, name, code)
      `, { count: 'exact' });

    if (student_id) {
      query = query.eq('student_id', student_id);
    }

    if (course_id) {
      query = query.eq('course_id', course_id);
    }

    if (status) {
      query = query.eq('status', status);
    }

    if (start_date) {
      query = query.gte('payment_date', start_date);
    }

    if (end_date) {
      query = query.lte('payment_date', end_date);
    }

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data: payments, error, count } = await query
      .order('payment_date', { ascending: false })
      .range(from, to);

    if (error) throw error;

    return c.json({
      success: true,
      data: payments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('获取缴费记录失败:', error);
    return c.json({
      success: false,
      message: '获取缴费记录失败',
      error: error.message
    }, 500);
  }
};

// 处理退款
const processRefund = async (c) => {
  try {
    const { payment_id, amount, reason, refund_method } = await c.req.json();
    const userId = c.get('userProfile').id;

    // 获取原缴费记录
    const { data: payment, error: paymentError } = await supabaseService
      .from('payments')
      .select('*')
      .eq('id', payment_id)
      .single();

    if (paymentError) throw paymentError;

    // 检查退款金额
    if (parseFloat(amount) > parseFloat(payment.amount)) {
      return c.json({
        success: false,
        message: '退款金额不能超过原缴费金额'
      }, 400);
    }

    // 创建退款记录
    const { data: refund, error } = await supabaseService
      .from('refunds')
      .insert({
        payment_id,
        amount,
        reason,
        refund_method,
        status: 'pending',
        processed_by: userId
      })
      .select()
      .single();

    if (error) throw error;

    // 更新缴费记录状态
    await supabaseService
      .from('payments')
      .update({ status: 'refunded' })
      .eq('id', payment_id);

    return c.json({
      success: true,
      message: '退款申请已提交',
      data: refund
    });
  } catch (error) {
    console.error('处理退款失败:', error);
    return c.json({
      success: false,
      message: '处理退款失败',
      error: error.message
    }, 500);
  }
};

// 获取退款记录
const getRefunds = async (c) => {
  try {
    const { status, start_date, end_date, page = 1, limit = 20 } = c.req.query();

    let query = supabaseService
      .from('refunds')
      .select(`
        *,
        payment:payment_id(
          *,
          student:student_id(id, name, student_id)
        )
      `, { count: 'exact' });

    if (status) {
      query = query.eq('status', status);
    }

    if (start_date) {
      query = query.gte('refund_date', start_date);
    }

    if (end_date) {
      query = query.lte('refund_date', end_date);
    }

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data: refunds, error, count } = await query
      .order('refund_date', { ascending: false })
      .range(from, to);

    if (error) throw error;

    return c.json({
      success: true,
      data: refunds,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('获取退款记录失败:', error);
    return c.json({
      success: false,
      message: '获取退款记录失败',
      error: error.message
    }, 500);
  }
};

// 更新月度统计
const updateMonthlySummary = async () => {
  try {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;

    // 获取本月财务记录
    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0, 23, 59, 59);

    const { data: records } = await supabaseService
      .from('financial_records')
      .select('*')
      .gte('created_at', startOfMonth.toISOString())
      .lte('created_at', endOfMonth.toISOString());

    // 获取学生和课程数量
    const { count: studentCount } = await supabaseService
      .from('user_profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role_id', 4); // 学生角色ID

    const { count: courseCount } = await supabaseService
      .from('courses')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'available');

    // 计算总收入和支出
    let totalIncome = 0;
    let totalExpense = 0;

    records.forEach(record => {
      if (record.type === 'income') {
        totalIncome += parseFloat(record.amount);
      } else {
        totalExpense += parseFloat(record.amount);
      }
    });

    // 更新或插入月度统计
    await supabaseService
      .from('financial_summaries')
      .upsert({
        year,
        month,
        total_income: totalIncome,
        total_expense: totalExpense,
        net_profit: totalIncome - totalExpense,
        student_count: studentCount || 0,
        course_count: courseCount || 0
      }, {
        onConflict: 'year,month'
      });
  } catch (error) {
    console.error('更新月度统计失败:', error);
  }
};

// 导出财务报表
const exportFinancialReport = async (c) => {
  try {
    const { startDate, endDate, type } = c.req.query();

    let query = supabaseService
      .from('financial_records')
      .select('*');

    if (startDate) {
      query = query.gte('created_at', startDate);
    }

    if (endDate) {
      query = query.lte('created_at', endDate);
    }

    if (type) {
      query = query.eq('type', type);
    }

    const { data: records, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;

    // 生成CSV格式数据
    const csvHeader = 'ID,类型,分类,金额,描述,支付方式,状态,创建时间\n';
    const csvData = records.map(record =>
      `${record.id},${record.type},${record.category},${record.amount},${record.description || ''},${record.payment_method || ''},${record.status},${record.created_at}`
    ).join('\n');

    const csv = csvHeader + csvData;

    c.header('Content-Type', 'text/csv');
    c.header('Content-Disposition', 'attachment; filename=financial_report.csv');
    return c.text(csv);
  } catch (error) {
    console.error('导出财务报表失败:', error);
    return c.json({
      success: false,
      message: '导出财务报表失败',
      error: error.message
    }, 500);
  }
};

export default {
  getFinancialStats,
  getMonthlyStats,
  createPayment,
  getPayments,
  processRefund,
  getRefunds,
  exportFinancialReport
};
