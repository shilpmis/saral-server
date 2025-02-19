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
  router.put('/user/:school_id/:user_id', [UsersController , 'update'])
  
  router.get('/classes/:school_id', [ClassesController , 'indexClassesForSchool']);
  router.post('/class/base', [ClassesController , 'createClass']);
  router.post('/classes', [ClassesController , 'createMultipleClasses']);
  router.post('/class/division', [ClassesController , 'createDivision']);
  router.put('/class/:class_id', [ClassesController , 'updateClass']);

  router.get('students/:class_id' , [StundetsController , 'indexClassStudents']);
  router.get('student/:school_id/:student_id' , [StundetsController , 'fetchStudent']);
  router.post('students/:class_id' , [StundetsController , 'createStudents']);
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
  router.put('teacher/:school_id/:teacher_id' , [TeachersController , 'updateTeacher'])

  router.get('other-staff/:school_id' , [OtherStaffsController , 'indexOtherStaffForSchool'])
  router.post('other-staff/:school_id' , [OtherStaffsController , 'createOtherStaff'])
  router.put('other-staff/:school_id/:other_staff' , [OtherStaffsController , 'updateOtherStaff'])


}).prefix('/api/v1/').use(middleware.auth())

