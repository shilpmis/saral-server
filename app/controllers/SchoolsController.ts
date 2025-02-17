import type { HttpContext } from '@adonisjs/core/http'
import Schools from '#models/Schools'
import { CreateValidatorForSchools, UpdateValidatorForSchools } from '#validators/Schools'


export default class SchoolsController {

  async index(ctx: HttpContext) {

    let school_id = ctx.params.school_id;
    let school = await Schools.query().where('id', school_id).first();
    if (school) {
      return ctx.response.status(201).json(school);
    }
    return ctx.response.status(404).json({ message: 'School not found' });
  }

  async update(ctx: HttpContext) {

    let school_id = ctx.params.school_id;
    let school = await Schools.query().where('id', school_id).first();

    if (school) {
      if (ctx.auth.user?.role_id === 1 && school_id == ctx.auth.user.school_id ) {
        return ctx.response.status(401).json({ message: 'Unauthorized' });
      }
      const data = await UpdateValidatorForSchools.validate(ctx.request.body());
      school.merge(data);
      let updated_school = await school.save();
      return ctx.response.status(201).json(updated_school);
    }
    return ctx.response.status(404).json({ message: 'School not found' });
  }
}



