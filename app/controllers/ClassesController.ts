import type { HttpContext } from '@adonisjs/core/http'
import classes from '#models/classes'
import { CreateValidatorForclasses, UpdateValidatorForclasses } from '#validators/classes'


export default class ClassesController {
  
  async index(ctx: HttpContext) {
    const classes = await classes.query().paginate(ctx.request.input('page', 1), 10);
    return ctx.response.json(classes.serialize());
  }

  async create(ctx: HttpContext) {
    const payload = await CreateValidatorForclasses.validate(ctx.request.all());
    const classes = await classes.create(payload);
    return ctx.response.json(classes.serialize());
  }

  async store(ctx: HttpContext) { }

  async show(ctx: HttpContext) {
    const classes = await classes.findOrFail(ctx.request.input('id'));
    return ctx.response.json(classes.serialize());
  }

  async update(ctx: HttpContext) {
    const payload = await UpdateValidatorForclasses.validate(ctx.request.all());
    const classes = await classes.findOrFail(ctx.request.input('id'));
    await classes.merge(payload).save();
    return ctx.response.json(classes.serialize());
  }

  async filterclasses(ctx: HttpContext) {
    const classes = await classes.query().where('role', 'student').paginate(ctx.request.input('page', 1), 10);
    return ctx.response.json(classes.serialize());
  }

  // async destroy(ctx: HttpContext) {
  //   const classes = await classes.findOrFail(ctx.request.input('id'));
  //   await user.delete();
  // }

  // async edit(ctx: HttpContext) {
  //   const payload = await UpdateValidatorForclasses.validate(ctx.request.all());
  //   const user = await classes.findOrFail(ctx.request.input('id'));
  //   user.merge(payload).save();
  //   return ctx.response.json(user.serialize());
  // }
}



