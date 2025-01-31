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
import StaffController from '#controllers/StaffController'
import UsersController from '#controllers/UsersController'

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

  
  router.get('/user/:school_id', [UsersController , 'indexSchoolUsers'])
  router.post('/user', [UsersController , 'createUser'])
  router.put('/user/:school_id/:user_id', [UsersController , 'update'])
  
  router.get('/classes/:school_id', [ClassesController , 'indexClassesForSchool']);
  router.post('/class', [ClassesController , 'createClass']);
  router.put('/class/:id', [ClassesController , 'updateClass']);

  router.get('/staff/:school_id', [StaffController , 'indexStaffForSchool']);
  router.post('/staff', [StaffController , 'createStaffRole']);
  router.put('/staff/:id', [StaffController , 'updateStaffRole']);
  router.delete('/staff/:id', [StaffController , 'deleteStaffRole']);





  router.post('/users', '#controllers/users_controller.store')
  router.get('/users', '#controllers/users_controller.index')
  router.get('/users/:id', '#controllers/users_controller.show')
  router.put('/users/:id', '#controllers/users_controller.update')
  router.delete('/users/:id', '#controllers/users_controller.destroy')

}).prefix('/api/v1/').use(middleware.auth())

