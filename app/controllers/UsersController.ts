import type { HttpContext } from '@adonisjs/core/http'
import { CreateValidatorForUsers, UpdateValidatorForUsers } from '#validators/Users'
import Users from '#models/User'
import User from '#models/User';


export default class UsersController {


  async indexSchoolUsers(ctx: HttpContext) {

    const user_type = ctx.request.input("type");
    const page = ctx.request.input("page", 1);

    if (ctx.params.school_id) {

      if (user_type === 'staff') {
        const users = await Users
          .query()
          .where('school_id', ctx.params.school_id)
          .andWhere('role_id', 6)
          .paginate(page, 6);
        return ctx.response.json(users.serialize());
      } else {
        const users = await Users
          .query()
          .where('school_id', ctx.params.school_id)
          .andWhereNot('role_id', 6)
          .paginate(page, 6);
        return ctx.response.json(users.serialize());
      }
    } else {
      return ctx.response.status(404).json({ message: 'School id is required' });
    }
  }

  async createUser(ctx: HttpContext) {

    let school_id = ctx.auth.user?.school_id;

    const payload = await CreateValidatorForUsers.validate(ctx.request.all());

    if (ctx.auth.user?.role_id == 1) {
      const user = await User.create({
        ...payload,
        school_id: school_id,
        saral_email: `${payload.username}@${ctx.auth.user?.username}.saral`
      });
      return ctx.response.json(user.serialize());
    } else {
      return ctx.response.status(404).json({ message: 'You are not authorized to perorm this action' });
    }
  }

  async update(ctx: HttpContext) {

    if (ctx.auth.user?.role_id == 1 || ctx.auth.user?.role_id == 2) {

      const payload = await UpdateValidatorForUsers.validate(ctx.request.all());
      if (ctx.auth.user?.id === ctx.params.user_id) {
        return ctx.response.status(404).json({ message: 'You are not authorized to modifiy your own role .' });
      }
      const user = await Users.findOrFail(ctx.params.user_id);
      if (user.school_id !== ctx.auth.user?.school_id) {
        return ctx.response.status(404).json({ message: 'You are not authorized to perform this action' });
      }
      user.merge(payload).save();
      return ctx.response.json(user.serialize());
    } else {
      return ctx.response.status(404).json({ message: 'You are not authorized to perform this action' });
    }
  }

}
