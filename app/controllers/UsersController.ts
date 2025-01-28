import type { HttpContext } from '@adonisjs/core/http'
import { CreateValidatorForUsers, UpdateValidatorForUsers } from '#validators/Users'
import Users from '#models/User'
import { RoleType } from '#enums/user.enum';


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
    try {
      // Validate the input payload
      const payload = await CreateValidatorForUsers.validate(ctx.request.all());
  
      // Create the user with proper type mapping
      const user = await Users.create({
        ...payload,
        role: RoleType[payload.role as keyof typeof RoleType], // Map role to enum
      });
  
      // Return the serialized response
      return ctx.response.status(201).json({
        message: 'User created successfully',
        data: user.serialize(),
      });
    } catch (error) {
      // Handle validation or database errors
      return ctx.response.status(400).json({
        message: 'Failed to create user',
        error: error.messages || error.message,
      });
    }
  }
  
  /**
   * Handle form submission to create a new post
   */
  async store(ctx: HttpContext) {
    try {
      // Validate the input payload using the validator
      const payload = await CreateValidatorForUsers.validate(ctx.request.all());
  
      // Create the user in the database
      const user = await Users.create({
        ...payload,
        role: RoleType[payload.role as keyof typeof RoleType], // Map role to enum
      });
  
      // Return a success response with a 201 status code
      return ctx.response.status(201).json({
        message: 'User created successfully',
        data: user.serialize(),
      });
    } catch (error) {
      // Handle validation or creation errors gracefully
      return ctx.response.status(400).json({
        message: 'Failed to create user',
        error: error.messages || error.message,
      });
    }
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
    try {
      // Validate the input payload using the update validator
      const payload = await UpdateValidatorForUsers.validate(ctx.request.all());
  
      // Fetch the user by ID, or return a 404 error if not found
      const user = await Users.findOrFail(ctx.request.input('id'));
  
      // Merge the new data and save the user
      user.merge(payload);
      await user.save();
  
      // Return a success response with a 200 status code
      return ctx.response.status(200).json({
        message: 'User updated successfully',
        data: user.serialize(),
      });
    } catch (error) {
      // Handle validation or user retrieval errors gracefully
      if (error.name === 'ModelNotFoundException') {
        return ctx.response.status(404).json({
          message: 'User not found',
        });
      }
  
      // Handle other errors (e.g., validation or database issues)
      return ctx.response.status(400).json({
        message: 'Failed to update user',
        error: error.messages || error.message,
      });
    }
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
