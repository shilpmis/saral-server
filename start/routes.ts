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
import StaffController from '#controllers/StaffMasterController'
import UsersController from '#controllers/UsersController'
import StundetsController from '#controllers/StundetsController'
import StaffMasterController from '#controllers/StaffMasterController'

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
  
  router.get('/user/:school_id', [UsersController , 'indexSchoolUsers'])
  router.post('/user', [UsersController , 'createUser'])
  router.put('/user/:school_id/:user_id', [UsersController , 'update'])
  
  router.get('/classes/:school_id', [ClassesController , 'indexClassesForSchool']);
  router.post('/class', [ClassesController , 'createClass']);
  router.post('/classes', [ClassesController , 'createMultipleClasses']);
  router.post('/class/division', [ClassesController , 'createDivision']);
  router.put('/class/:class_id', [ClassesController , 'updateClass']);

  router.get('students/:class_id' , [StundetsController , 'indexClassStudents']);
  router.post('students/:class_id' , [StundetsController , 'createStudents']);
  router.put('students/:class_id' , [StundetsController , 'updateStudents']);

  router.get('/staff-master/:school_id', [StaffMasterController , 'indexStaffMasterForSchool']);
  router.post('/staff-master', [StaffMasterController , 'createStaffMasterRole']);
  router.put('/staff-master/:id', [StaffMasterController , 'updateStaffMasterRole']);
  router.delete('/staff-master/:id', [StaffMasterController , 'deleteStaffMasterRole']);

  router.post('/users', '#controllers/users_controller.store')
  router.get('/users', '#controllers/users_controller.index')
  router.get('/users/:id', '#controllers/users_controller.show')
  router.put('/users/:id', '#controllers/users_controller.update')
  router.delete('/users/:id', '#controllers/users_controller.destroy')

}).prefix('/api/v1/').use(middleware.auth())

