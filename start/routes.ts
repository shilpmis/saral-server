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

  
  router.post('/create/user', [AuthController , 'createUser'])
  
  router.post('/create/class', [ClassesController , 'createClass'])



  router.post('/users', '#controllers/users_controller.store')
  router.get('/users', '#controllers/users_controller.index')
  router.get('/users/:id', '#controllers/users_controller.show')
  router.put('/users/:id', '#controllers/users_controller.update')
  router.delete('/users/:id', '#controllers/users_controller.destroy')

}).prefix('/api/v1/').use(middleware.auth())

