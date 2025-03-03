/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'
import { middleware } from './kernel.js'
import AuthController from '#controllers/AuthController'
import ClassesController from '#controllers/ClassesController'
import UsersController from '#controllers/UsersController'
import StundetsController from '#controllers/StundetsController'
import StaffMasterController from '#controllers/StaffMasterController'
import SchoolsController from '#controllers/SchoolsController'
import TeachersController from '#controllers/TeachersController'
import OtherStaffsController from '#controllers/OtherStaffsController'
import LeavesController from '#controllers/LeavesController'
import AttendanceController from '#controllers/AttendancesController'
import InquiriesController from '#controllers/InquiriesController'

// router.get('/', async () => {
//   return {
//     hello: 'Hello world',
//   }
// })

router.group(() => {

  router.post('/signup', [AuthController, 'createSchool'])
  router.post('/login', [AuthController, 'login'])

}).prefix('/api/v1/')

router.group(() => {

  router.get('/verify', [AuthController, 'verifyUser'])
  router.get('/logout', [AuthController, 'logout'])

  router.get('/stats', [SchoolsController, 'fetchSchoolDataForDashBoard'])
  router.get('/school/:school_id', [SchoolsController, 'index'])
  router.put('/school/:school_id', [SchoolsController, 'update'])

  router.get('/users', [UsersController, 'indexSchoolUsers'])
  router.post('/user', [UsersController, 'createUser'])
  router.put('/user/:user_id', [UsersController, 'update'])
  router.post('/user/onboard/teacher', [UsersController, 'onBoardTeacherAsUser'])
  router.put('/user/onboard/teacher/:user_id', [UsersController, 'UpdateOnBoardedTeacher'])

  router.get('/classes/:school_id', [ClassesController, 'indexClassesForSchool']);
  router.post('/class/base', [ClassesController, 'createClass']);
  router.post('/classes', [ClassesController, 'createMultipleClasses']);
  router.post('/class/division', [ClassesController, 'createDivision']);
  router.put('/class/:class_id', [ClassesController, 'updateClass']);

  router.get('students/:class_id', [StundetsController, 'indexClassStudents']);
  router.get('student/:school_id/:student_id', [StundetsController, 'fetchStudent']);
  router.post('student', [StundetsController, 'createSingleStudent']);
  router.post('students/multiple/:class_id', [StundetsController, 'createMultipleStudents']);
  router.put('student/:student_id', [StundetsController, 'updateStudents']);
  router.post('students/bulk-upload/:school_id/', [StundetsController, 'bulkUploadStudents']);

  router.get('/staff/:school_id', [StaffMasterController, 'indexStaffMasterForSchool']);
  router.post('/staff', [StaffMasterController, 'createStaffRole']);
  router.put('/staff/:id', [StaffMasterController, 'updateStaffRole']);
  router.delete('/staff/:id', [StaffMasterController, 'deleteStaffRole']);

  /**
   * need think of for adding school_id in teachers creation
   */
  router.get('teachers/:school_id', [TeachersController, 'indexTeachersForSchool'])
  router.get('teachers/activeuser/:school_id', [TeachersController, 'indexTeacherActiveAsUser'])
  router.get('teachers/non-activeuser/:school_id', [TeachersController, 'indexTeacherNotActiveAsUser'])
  router.post('teachers/:school_id', [TeachersController, 'createTeacher'])
  router.put('teacher/:school_id/:teacher_id', [TeachersController, 'updateTeacher']);
  router.post('teachers/bulk-upload/:school_id/', [TeachersController, 'bulkUploadTeachers'])

  router.get('other-staff/:school_id', [OtherStaffsController, 'indexOtherStaffForSchool'])
  router.post('other-staff/:school_id', [OtherStaffsController, 'createOtherStaff'])
  router.put('other-staff/:school_id/:other_staff', [OtherStaffsController, 'updateOtherStaff'])

  router.get('leave-type', [LeavesController, 'indexLeaveTypesForSchool'])
  router.post('leave-type', [LeavesController, 'createLeaveTypeForSchool'])
  router.put('leave-type/:leave_type_id', [LeavesController, 'updateLeaveTypeForSchool'])
  router.get('leave-policy', [LeavesController, 'indexLeavePolicyForSchool'])
  router.get('leave-policy/user', [LeavesController, 'indexLeavePolicyForUser'])
  router.post('leave-policy', [LeavesController, 'createLeavePolicyForSchool'])
  router.put('leave-policy/:leave_policy_id', [LeavesController, 'updateLeavePolicyForSchool'])

  router.get('leave-application/:staff_id', [LeavesController, 'fetchLeaveApplication'])
  router.get('leave-application', [LeavesController, 'fetchLeaveApplicationForAdmin'])
  router.post('leave-application', [LeavesController, 'applyForLeave'])
  router.put('leave-application/:uuid', [LeavesController, 'updateAppliedLeave'])
  router.put('/leave-application/other/status/:uuid', [LeavesController, 'approveOtherStaffLeaveApplication'])
  router.put('/leave-application/teacher/status/:uuid', [LeavesController, 'approveTeachersLeaveApplication'])

  router.get('attendance/:class_id/:unix_date', [AttendanceController, 'getAttendanceDetails'])
  router.post('attendance', [AttendanceController, 'markAttendance'])

  router.get('/inquiries' , [InquiriesController , 'indexInquiries'])
  router.post('/inquiry' , [InquiriesController , 'addInquiry'])
  router.get('/inquiry/:id' , [InquiriesController , 'updateInquiry'])

}).prefix('/api/v1/').use(middleware.auth())

