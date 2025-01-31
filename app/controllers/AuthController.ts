import Schools from '#models/Schools';
import User from '#models/User';
import { CreateValidatorForSchools } from '#validators/Schools';
import { CreateValidatorForUsers } from '#validators/Users';
import type { HttpContext } from '@adonisjs/core/http'
import hash from '@adonisjs/core/services/hash';
// import Auth from '#models/Auth'
// import { CreateValidatorForAuth, UpdateValidatorForAuth } from '#validators/Auth'


export default class AuthController {

  /**
   * Controller for create/regoster the schools & create a one admin level users default 
   * 
   * 
   * @param ctx 
   * @returns 
   */
  async createSchool(ctx: HttpContext) {
    const payload = await CreateValidatorForSchools.validate(ctx.request.all());
    const school = await Schools.create(payload);

    /**
     * Create one admin level role for this school
     */
    const admin_user = await User.create({
      school_id: school.id,
      saral_email: `admin@${school.username}.saral`,
      password: '12345678',
      role_id: 1,
      username : 'admin',
      name : 'Admin'
    });
    return ctx.response.json({ school: school.serialize(), admin: admin_user.serialize() });
  }

  async login(ctx: HttpContext) {
    const { email, password } = ctx.request.all();
    if (email) {
      try {
        let user = await User.query().preload('school').where('saral_email', email).first();
        if (user && await hash.verify(user.password, password)) {
          const token = await User.accessTokens.create(user);
          return ctx.response.json({ user: user.serialize(), token });
        }
        return ctx.response.status(404).json({ message: 'Your email or password might not br correct !!' });
      } catch (error) {
        console.log("error" , error);
        return ctx.response.status(500).json({ message: 'Internal Server Error !! Please contact service center !' });
      }
    }
  }

}



