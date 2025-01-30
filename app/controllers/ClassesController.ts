import type { HttpContext } from '@adonisjs/core/http'
import Classes from '#models/Classes'
import { CreateValidatorForClasses, UpdateValidatorForClasses } from '#validators/Classes'


export default class ClassesController {

  async createClass(ctx: HttpContext) {

    let school_id = ctx.auth.user?.school_id
    if (ctx.auth.user?.role_id !== 1) {
      return ctx.response.status(403).json({ message: 'You are not allocated to manage this functions.' });
    }
    const payload = await CreateValidatorForClasses.validate(ctx.request.body());
    const created_class = await Classes.create({ ...payload, school_id: school_id });
    return ctx.response.json(created_class.serialize());
  }

  async updateClass(ctx: HttpContext) {

    // let school_id = ctx.auth.user?.school_id
    if (ctx.auth.user?.role_id !== 1) {
      return ctx.response.status(403).json({ message: 'You are not allocated to manage this functions.' });
    }
    const payload = await UpdateValidatorForClasses.validate(ctx.request.body());
    // const class_id = ctx.params.id;
    const updated_class = await Classes.findOrFail(ctx.params.id);
    updated_class.merge(payload);
    await updated_class.save();
    return ctx.response.json(updated_class.serialize());
  }
}



