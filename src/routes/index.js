import { Hono } from 'hono';
import authController from '../controllers/auth.js';
import studentController from '../controllers/student.js';
import teacherController from '../controllers/teacher.js';
import staffController from '../controllers/staff.js';
import adminController from '../controllers/admin.js';
import financialController from '../controllers/financial.js';
import { authMiddleware, roleMiddleware } from '../middleware/auth.js';

const router = new Hono();

// 角色ID映射
const ROLES = {
  ADMIN: 1,
  STAFF: 2,
  TEACHER: 3,
  STUDENT: 4
};

// 公开路由
router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);
router.post('/auth/refresh', authController.refreshToken);
router.post('/auth/logout', authController.logout);

// 需要认证的路由
router.get('/auth/me', authMiddleware, authController.getCurrentUser);

// 学生路由
router.get('/student/dashboard', authMiddleware, roleMiddleware([ROLES.STUDENT]), studentController.getDashboard);
router.get('/student/courses/available', authMiddleware, roleMiddleware([ROLES.STUDENT]), studentController.getAvailableCourses);
router.post('/student/courses/enroll', authMiddleware, roleMiddleware([ROLES.STUDENT]), studentController.enrollCourse);
router.post('/student/courses/drop', authMiddleware, roleMiddleware([ROLES.STUDENT]), studentController.dropCourse);
router.get('/student/courses/enrolled', authMiddleware, roleMiddleware([ROLES.STUDENT]), studentController.getEnrolledCourses);
router.get('/student/grades', authMiddleware, roleMiddleware([ROLES.STUDENT]), studentController.getGrades);
router.get('/student/schedule', authMiddleware, roleMiddleware([ROLES.STUDENT]), studentController.getSchedule);
router.post('/student/evaluations', authMiddleware, roleMiddleware([ROLES.STUDENT]), studentController.submitEvaluation);
router.get('/student/teaching-plan', authMiddleware, roleMiddleware([ROLES.STUDENT]), studentController.getTeachingPlan);
router.get('/student/training-program', authMiddleware, roleMiddleware([ROLES.STUDENT]), studentController.getTrainingProgram);
router.put('/student/profile', authMiddleware, roleMiddleware([ROLES.STUDENT]), studentController.updateProfile);
router.post('/student/password', authMiddleware, roleMiddleware([ROLES.STUDENT]), studentController.changePassword);

// 教师路由
router.get('/teacher/courses', authMiddleware, roleMiddleware([ROLES.TEACHER]), teacherController.getMyCourses);
router.get('/teacher/courses/:courseId/students', authMiddleware, roleMiddleware([ROLES.TEACHER]), teacherController.getCourseStudents);
router.post('/teacher/grades', authMiddleware, roleMiddleware([ROLES.TEACHER]), teacherController.enterGrades);
router.get('/teacher/courses/:courseId/evaluations', authMiddleware, roleMiddleware([ROLES.TEACHER]), teacherController.getCourseEvaluations);
router.get('/teacher/schedule', authMiddleware, roleMiddleware([ROLES.TEACHER]), teacherController.getMySchedule);
router.get('/teacher/courses/:courseId/statistics', authMiddleware, roleMiddleware([ROLES.TEACHER]), teacherController.getGradeStatistics);
router.put('/teacher/profile', authMiddleware, roleMiddleware([ROLES.TEACHER]), teacherController.updateProfile);
router.post('/teacher/courses/apply', authMiddleware, roleMiddleware([ROLES.TEACHER]), teacherController.applyForCourse);
router.get('/teacher/applications', authMiddleware, roleMiddleware([ROLES.TEACHER]), teacherController.getMyApplications);

// 教务人员路由

// 学院管理
router.get('/staff/colleges', authMiddleware, roleMiddleware([ROLES.STAFF, ROLES.ADMIN]), staffController.getColleges);
router.post('/staff/colleges', authMiddleware, roleMiddleware([ROLES.STAFF, ROLES.ADMIN]), staffController.createCollege);
router.put('/staff/colleges/:id', authMiddleware, roleMiddleware([ROLES.STAFF, ROLES.ADMIN]), staffController.updateCollege);
router.delete('/staff/colleges/:id', authMiddleware, roleMiddleware([ROLES.STAFF, ROLES.ADMIN]), staffController.deleteCollege);

// 专业管理
router.get('/staff/majors', authMiddleware, roleMiddleware([ROLES.STAFF, ROLES.ADMIN]), staffController.getMajors);
router.post('/staff/majors', authMiddleware, roleMiddleware([ROLES.STAFF, ROLES.ADMIN]), staffController.createMajor);
router.put('/staff/majors/:id', authMiddleware, roleMiddleware([ROLES.STAFF, ROLES.ADMIN]), staffController.updateMajor);
router.delete('/staff/majors/:id', authMiddleware, roleMiddleware([ROLES.STAFF, ROLES.ADMIN]), staffController.deleteMajor);

// 班级管理
router.get('/staff/classes', authMiddleware, roleMiddleware([ROLES.STAFF, ROLES.ADMIN]), staffController.getClasses);
router.post('/staff/classes', authMiddleware, roleMiddleware([ROLES.STAFF, ROLES.ADMIN]), staffController.createClass);
router.put('/staff/classes/:id', authMiddleware, roleMiddleware([ROLES.STAFF, ROLES.ADMIN]), staffController.updateClass);
router.delete('/staff/classes/:id', authMiddleware, roleMiddleware([ROLES.STAFF, ROLES.ADMIN]), staffController.deleteClass);

// 教学计划管理
router.get('/staff/teaching-plans', authMiddleware, roleMiddleware([ROLES.STAFF, ROLES.ADMIN]), staffController.getTeachingPlans);
router.post('/staff/teaching-plans', authMiddleware, roleMiddleware([ROLES.STAFF, ROLES.ADMIN]), staffController.createTeachingPlan);
router.delete('/staff/teaching-plans/:id', authMiddleware, roleMiddleware([ROLES.STAFF, ROLES.ADMIN]), staffController.deleteTeachingPlan);

// 培养方案管理
router.get('/staff/training-programs', authMiddleware, roleMiddleware([ROLES.STAFF, ROLES.ADMIN]), staffController.getTrainingPrograms);
router.post('/staff/training-programs', authMiddleware, roleMiddleware([ROLES.STAFF, ROLES.ADMIN]), staffController.createTrainingProgram);
router.put('/staff/training-programs/:id', authMiddleware, roleMiddleware([ROLES.STAFF, ROLES.ADMIN]), staffController.updateTrainingProgram);
router.delete('/staff/training-programs/:id', authMiddleware, roleMiddleware([ROLES.STAFF, ROLES.ADMIN]), staffController.deleteTrainingProgram);

// 申请管理
router.get('/staff/applications', authMiddleware, roleMiddleware([ROLES.STAFF, ROLES.ADMIN]), staffController.getApplications);
router.put('/staff/applications/:id', authMiddleware, roleMiddleware([ROLES.STAFF, ROLES.ADMIN]), staffController.processApplication);

// 学生管理
router.get('/staff/students', authMiddleware, roleMiddleware([ROLES.STAFF, ROLES.ADMIN]), staffController.getStudents);

// 评价管理
router.get('/staff/evaluations', authMiddleware, roleMiddleware([ROLES.STAFF, ROLES.ADMIN]), staffController.getEvaluations);

// 统计报表管理
router.get('/staff/statistics/students', authMiddleware, roleMiddleware([ROLES.STAFF, ROLES.ADMIN]), staffController.getStudentStatistics);
router.get('/staff/statistics/courses', authMiddleware, roleMiddleware([ROLES.STAFF, ROLES.ADMIN]), staffController.getCourseStatistics);
router.get('/staff/statistics/teachers', authMiddleware, roleMiddleware([ROLES.STAFF, ROLES.ADMIN]), staffController.getTeacherStatistics);
router.get('/staff/statistics/export', authMiddleware, roleMiddleware([ROLES.STAFF, ROLES.ADMIN]), staffController.exportStatisticsReport);

// 财务统计报表
router.get('/staff/statistics/financial', authMiddleware, roleMiddleware([ROLES.STAFF, ROLES.ADMIN]), financialController.getFinancialAnalysis);
router.get('/staff/statistics/financial/export', authMiddleware, roleMiddleware([ROLES.STAFF, ROLES.ADMIN]), financialController.exportFinancialReport);

// 管理员路由

// 用户管理
router.get('/admin/users', authMiddleware, roleMiddleware([ROLES.ADMIN]), adminController.getAllUsers);
router.post('/admin/users', authMiddleware, roleMiddleware([ROLES.ADMIN]), adminController.createUser);
router.put('/admin/users/:id', authMiddleware, roleMiddleware([ROLES.ADMIN]), adminController.updateUser);
router.delete('/admin/users/:id', authMiddleware, roleMiddleware([ROLES.ADMIN]), adminController.deleteUser);
router.post('/admin/users/reset-password', authMiddleware, roleMiddleware([ROLES.ADMIN]), adminController.resetPassword);

// 角色管理
router.get('/admin/roles', authMiddleware, roleMiddleware([ROLES.ADMIN]), adminController.getAllRoles);
router.post('/admin/roles', authMiddleware, roleMiddleware([ROLES.ADMIN]), adminController.createRole);
router.put('/admin/roles/:id', authMiddleware, roleMiddleware([ROLES.ADMIN]), adminController.updateRole);
router.delete('/admin/roles/:id', authMiddleware, roleMiddleware([ROLES.ADMIN]), adminController.deleteRole);

// 权限管理
router.get('/admin/users/:userId/roles', authMiddleware, roleMiddleware([ROLES.ADMIN]), adminController.getUserRoles);
router.post('/admin/users/roles/assign', authMiddleware, roleMiddleware([ROLES.ADMIN]), adminController.assignRole);
router.post('/admin/users/roles/remove', authMiddleware, roleMiddleware([ROLES.ADMIN]), adminController.removeRole);

// 系统统计
router.get('/admin/stats', authMiddleware, roleMiddleware([ROLES.ADMIN]), adminController.getSystemStats);

// 系统设置路由
router.get('/admin/settings/system', authMiddleware, roleMiddleware([ROLES.ADMIN]), adminController.getSystemSettings);
router.put('/admin/settings/system', authMiddleware, roleMiddleware([ROLES.ADMIN]), adminController.updateSystemSettings);
router.get('/admin/settings/notification', authMiddleware, roleMiddleware([ROLES.ADMIN]), adminController.getNotificationSettings);
router.put('/admin/settings/notification', authMiddleware, roleMiddleware([ROLES.ADMIN]), adminController.updateNotificationSettings);
router.get('/admin/settings/security', authMiddleware, roleMiddleware([ROLES.ADMIN]), adminController.getSecuritySettings);
router.put('/admin/settings/security', authMiddleware, roleMiddleware([ROLES.ADMIN]), adminController.updateSecuritySettings);

// 系统日志和审计路由
router.get('/admin/logs/system', authMiddleware, roleMiddleware([ROLES.ADMIN]), adminController.getSystemLogs);
router.get('/admin/logs/audit', authMiddleware, roleMiddleware([ROLES.ADMIN]), adminController.getAuditLogs);
router.post('/admin/logs/cleanup', authMiddleware, roleMiddleware([ROLES.ADMIN]), adminController.cleanupSystemLogs);
router.get('/admin/logs/activity', authMiddleware, roleMiddleware([ROLES.ADMIN]), adminController.getSystemActivityStats);

export default router;
