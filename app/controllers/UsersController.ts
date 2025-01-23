import type { HttpContext } from '@adonisjs/core/http'
import { CreateValidatorForUsers, UpdateValidatorForUsers } from '#validators/Users'
import Users from '#models/User'


export default class UsersController {
  /**
   * Return list of all posts or paginate through
   * them
   */
  async index(ctx: HttpContext) {
    const users = await Users.query().paginate(ctx.request.input('page', 1), 10);
    return ctx.response.json(users.serialize());
  }

  /**
   * Render the form to create a new post.
   *
   * Not needed if you are creating an API server.
   */
  async create(ctx: HttpContext) {
    const payload = await CreateValidatorForUsers.validate(ctx.request.all());
    const user = await Users.create(payload);
    return ctx.response.json(user.serialize());
  }

  /**
   * Handle form submission to create a new post
   */
  async store(ctx: HttpContext) { 
    const payload = await CreateValidatorForUsers.validate(ctx.request.all());
    const user = await Users.create(payload);
    return ctx.response.json(user.serialize());
  }

  /**
   * Display a single post by id.
   */
  async show(ctx: HttpContext) {
    const user = await Users.findOrFail(ctx.request.input('id'));
    return ctx.response.json(user.serialize());
  }


  /**
   * Handle the form submission to update a specific post by id
  */
  async update(ctx: HttpContext) {
    const payload = await UpdateValidatorForUsers.validate(ctx.request.all());
    const user = await Users.findOrFail(ctx.request.input('id'));
    user.merge(payload).save();
    return ctx.response.json(user.serialize());
  }

  async filterUsers(ctx: HttpContext) {
    const users = await Users.query().where('role', 'student').paginate(ctx.request.input('page', 1), 10);
    return ctx.response.json(users.serialize());
  }

  /**
   * Handle the form submission to delete a specific post by id.
  */
  // async destroy(ctx: HttpContext) {
  //   const user = await Users.findOrFail(ctx.request.input('id'));
  //   await user.delete();
  // }

  // /**
  //  * Render the form to edit an existing post by its id.
  //  *
  //  * Not needed if you are creating an API server.
  //  */
  // async edit(ctx: HttpContext) {
  //   const payload = await UpdateValidatorForUsers.validate(ctx.request.all());
  //   const user = await Users.findOrFail(ctx.request.input('id'));
  //   user.merge(payload).save();
  //   return ctx.response.json(user.serialize());
  // }
}


/**  
 *   Schools,  
 *   Users (Admin , IT , Clerck), 
 *   Students - (Parent Details) 
 *   Teachers 
 *   Classes 
 *   Subjects
 *   Attendance
 *   Fees
 *   Exam
 *   Result
 *   Settings
 * 
 *   School ---- List of schools which are registered 
 *   Users ---- admin , clerck & IT-administrator , Hostel 
 *   Teachers  --- Prinicipal and teachers 
 *   Students --- Students
 *   Classes --- Classes
 *   Subjects --- Subjects
 *   Fees --- Fees
 *   Exam --- Exam
 *   Settings --- Settings
 *   Result --- Result
 *   Attendance --- Attendance
 *    
 * 
 */
