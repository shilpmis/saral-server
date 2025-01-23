import type { HttpContext } from '@adonisjs/core/http'
import Schools from '#models/Schools'
import { CreateValidatorForSchools , UpdateValidatorForSchools } from '#validators/Schools'


export default class SchoolsController {
  /**
   * Return list of all posts or paginate through
   * them
   */
  async index(ctx: HttpContext) {
    const schools = await Schools.query().paginate(ctx.request.input('page', 1), 10);
    return ctx.response.json(schools.serialize());
  }

  /**
   * Render the form to create a new post.
   *
   * Not needed if you are creating an API server.
   */
  async create(ctx: HttpContext) {
    const payload = await CreateValidatorForSchools.validate(ctx.request.all());
    const schools = await Schools.create(payload);
    return ctx.response.json(schools.serialize());
  }

  /**
   * Handle form submission to create a new post
   */
  async store(ctx: HttpContext) { }

  /**
   * Display a single post by id.
   */
  async show(ctx: HttpContext) {
    const schools = await Schools.findOrFail(ctx.request.input('id'));
    return ctx.response.json(schools.serialize());
  }


  /**
   * Handle the form submission to update a specific post by id
  */
  async update(ctx: HttpContext) {
    const payload = await UpdateValidatorForSchools.validate(ctx.request.all());
    const schools = await Schools.findOrFail(ctx.request.input('id'));
    await schools.merge(payload).save();
    return ctx.response.json(schools.serialize());
  }

  async filterSchools(ctx: HttpContext) {
    const schools = await Schools.query().where('role', 'student').paginate(ctx.request.input('page', 1), 10);
    return ctx.response.json(schools.serialize());
  }

  /**
   * Handle the form submission to delete a specific post by id.
  */
  // async destroy(ctx: HttpContext) {
  //   const schools = await Schools.findOrFail(ctx.request.input('id'));
  //   await user.delete();
  // }
  

  // /**
  //  * Render the form to edit an existing post by its id.
  //  *
  //  * Not needed if you are creating an API server.
  //  */
  // async edit(ctx: HttpContext) {
  //   const payload = await UpdateValidatorForSchools.validate(ctx.request.all());
  //   const user = await Schools.findOrFail(ctx.request.input('id'));
  //   user.merge(payload).save();
  //   return ctx.response.json(user.serialize());
  // }
}



