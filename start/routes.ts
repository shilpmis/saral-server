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

router.get('/', async () => {
  return {
    hello: 'Hello world',
  }
})

router.group(() => {

  router.post('/signup', [AuthController , 'createSchool']) 
  router.post('/login', [AuthController , 'login'])
  
}).prefix('/api/v1/')

router.group(() => {
  
  router.get('/verify', [AuthController , 'verifyUser'])
  router.get('/logout', [AuthController , 'logout'])

  router.get('/school/:school_id' , [SchoolsController , 'index'])
  router.put('/school/:school_id' , [SchoolsController , 'update'])
  
  router.get('/users/:school_id', [UsersController , 'indexSchoolUsers'])
  router.post('/user', [UsersController , 'createUser'])
  router.put('/user/:user_id', [UsersController , 'update'])
  
  router.get('/classes/:school_id', [ClassesController , 'indexClassesForSchool']);
  router.post('/class/base', [ClassesController , 'createClass']);
  router.post('/classes', [ClassesController , 'createMultipleClasses']);
  router.post('/class/division', [ClassesController , 'createDivision']);
  router.put('/class/:class_id', [ClassesController , 'updateClass']);

  router.get('students/:class_id' , [StundetsController , 'indexClassStudents']);
  router.get('student/:school_id/:student_id' , [StundetsController , 'fetchStudent']);
  router.post('student' , [StundetsController , 'createSingleStudent']);
  router.post('students/multiple/:class_id' , [StundetsController , 'createMultipleStudents']);
  router.put('student/:student_id' , [StundetsController , 'updateStudents']);

  router.get('/staff/:school_id', [StaffMasterController , 'indexStaffMasterForSchool']);
  router.post('/staff', [StaffMasterController , 'createStaffRole']);
  router.put('/staff/:id', [StaffMasterController , 'updateStaffRole']);
  router.delete('/staff/:id', [StaffMasterController , 'deleteStaffRole']);

  /**
   * need think of for adding school_id in teachers creation
   */
  router.get('teachers/:school_id' , [TeachersController , 'indexTeachersForSchool'])
  router.post('teachers/:school_id' , [TeachersController , 'createTeacher'])
  router.put('teacher/:school_id/:teacher_id' , [TeachersController , 'updateTeacher']);
  router.post('teachers/bulk-upload/:school_id/' , [TeachersController , 'bulkUploadTeachers'])

  router.get('other-staff/:school_id' , [OtherStaffsController , 'indexOtherStaffForSchool'])
  router.post('other-staff/:school_id' , [OtherStaffsController , 'createOtherStaff'])
  router.put('other-staff/:school_id/:other_staff' , [OtherStaffsController , 'updateOtherStaff'])

  router.get('leave-type', [LeavesController, 'indexLeaveTypesForSchool'])
  router.post('leave-type', [LeavesController, 'createLeaveTypeForSchool'])
  router.put('leave-type/:leave_type_id', [LeavesController, 'updateLeaveTypeForSchool'])
  router.get('leave-policy', [LeavesController, 'indexLeavePolicyForSchool'])
  router.post('leave-policy', [LeavesController, 'createLeavePolicyForSchool'])
  router.put('leave-policy/:leave_policy_id', [LeavesController, 'updateLeavePolicyForSchool'])
  router.post('leave-application', [LeavesController, 'applyForLeave'])
  router.put('leave-application/:uuid', [LeavesController, 'updateAppliedLeave'])

}).prefix('/api/v1/').use(middleware.auth())

