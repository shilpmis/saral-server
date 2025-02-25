import Schools from '#models/Schools';
import User from '#models/User';
import { CreateValidatorForSchools } from '#validators/Schools';
import type { HttpContext } from '@adonisjs/core/http'
import hash from '@adonisjs/core/services/hash';
import auth from '@adonisjs/auth/services/main';
import db from '@adonisjs/lucid/services/db'
import { DateTime } from 'luxon';




export default class AuthController {

  /**
   * Controller for create/regoster the schools & create a one admin level users default 
   * 
   * 
   * @param ctx 
   * @returns 
   */
  async createSchool(ctx: HttpContext) {

    let trx = await db.transaction();

    try {
      const payload = await CreateValidatorForSchools.validate(ctx.request.all());
      const school = await Schools.create(payload, { client: trx });

      /**
      * Create one admin level role for this school
      */
      const admin_user = await User.create({
        school_id: school.id,
        saral_email: `admin@${school.username}.saral`,
        password: '12345678',
        role_id: 1,
        username: `admin-${school.username}`,
        name: 'Admin',
        is_active: true
      }, { client: trx });


      await trx.commit();
      return ctx.response.json({ school: school.serialize(), admin: admin_user.serialize() });

    } catch (error) {
      await trx.rollback();
      return ctx.response.status(500).json({
        message: 'Internal Server Error !! Please contact service center !',
        error: error
      });

    }

  }

  async login(ctx: HttpContext) {
    const { email, password } = ctx.request.all();

    if (email) {
      try {
        let user = await User.query().preload('school').where('saral_email', email).first();
        if (user && await hash.verify(user.password, password)) {
          const token = await User.accessTokens.create(user, ['*'], {
            expiresIn: '7 days' // expires in 30 days
          });
          return ctx.response.json({ user: user.serialize(), token });
        }
        return ctx.response.status(404).json({ message: 'Your email or password might not br correct !!' });
      } catch (error) {
        console.log("error", error);
        return ctx.response.status(500).json({ message: 'Internal Server Error !! Please contact service center !' });
      }
    }
  }

  async verifyUser(ctx: HttpContext) {

    if (!ctx.auth.user) {
      return ctx.response.status(401).json({ message: 'Unauthorized' });
    } else {
      // let auth = await ctx.auth.use('api').authenticate();
      let user = await User.query().preload('school').where('id', ctx.auth.user.id).first();
      if (user) {

        const token = await User.accessTokens.create(user, ['*'], {
          expiresIn: '7 days' // expires in 30 days
        });
        return ctx.response.json({ user: user.serialize() });
      }
      else
        return ctx.response.status(501).json({ message: 'Internal Server Error!' });

    }
  }

  async logout(ctx: HttpContext) {


    if (!ctx.auth.user) {
      return ctx.response.status(404).json({ message: 'Bad Request' });
    }

    let now = DateTime.now().toFormat('yyyy-MM-dd HH:mm:ss') // Format current time

    let token = await db.rawQuery('SELECT * FROM auth_access_tokens WHERE tokenable_id = ? ORDER BY created_at desc LIMIT 1', [ctx.auth.user.id])

    await db.rawQuery('UPDATE auth_access_tokens SET expires_at = ? WHERE id = ?', [
      now, token[0][0].id])

    return ctx.response.json({ message: "You have been logout succesfully ! " })
  }

}



