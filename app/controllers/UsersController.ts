import type { HttpContext } from '@adonisjs/core/http'
import { CreateValidatorForOnBoardTeacherAsUser, CreateValidatorForUsers, UpdateValidatorForOnBoardTeacherAsUser, UpdateValidatorForUsers } from '#validators/Users'
import Users from '#models/User'
import User from '#models/User';
import Teacher from '#models/Teacher';
import Schools from '#models/Schools';
import Classes from '#models/Classes';
import db from '@adonisjs/lucid/services/db';


export default class UsersController {


  async indexSchoolUsers(ctx: HttpContext) {

    const user_type = ctx.request.input("type");
    const page = ctx.request.input("page", 1);

    if (user_type === 'teacher') {
      const users = await Users
        .query()
        .preload('teacher', (query) => {
          query.select('id', 'first_name', 'last_name', 'middle_name', 'class_id'); // Only fetching required staff fields
        })
        .where('role_id', 6)
        .andWhere('school_id', ctx.auth.user!.school_id)
        .paginate(page, 6);
      return ctx.response.json(users.serialize());
    }
    const users = await Users
      .query()
      .where('school_id', ctx.auth.user!.school_id)
      .andWhereNot('role_id', 6)
      .paginate(page, 6);
    return ctx.response.json(users.serialize());

  }

  async createUser(ctx: HttpContext) {


    try {
      let school_id = ctx.auth.user?.school_id;

      const payload = await CreateValidatorForUsers.validate(ctx.request.all());

      const school = await Schools.findBy('id', school_id)

      let user_type = payload.role_id === 1 ? 'admin'
        : payload.role_id === 2 ? 'principal'
          : payload.role_id === 3 ? 'head-teacher'
            : payload.role_id === 4 ? 'clerk'
              : payload.role_id === 5 ? 'it-admin' : 'default'

      if (ctx.auth.user?.role_id == 1) {
        const user = await User.create({
          ...payload,
          school_id: school_id,
          is_active: true,
          password: "12345678",
          saral_email: `${user_type}@${school?.branch_code}.saral`
        });
        return ctx.response.json(user.serialize());
      } else {
        return ctx.response.status(404).json({ message: 'You are not authorized to perorm this action' });
      }
    } catch (error) {
      return ctx.response.status(501).json({
        message: error
      });
    }
  }

  async onBoardTeacherAsUser(ctx: HttpContext) {


    if (ctx.auth.user?.role_id !== 1) {
      return ctx.response.status(401).json({
        message: "You are not authorized to perform this action"
      })
    }
    const payload = await CreateValidatorForOnBoardTeacherAsUser.validate(ctx.request.all());

    const teacher = await
      Teacher
        .query()
        .preload('school')
        .where('id', payload.teacher_id)
        .andWhere('school_id', ctx.auth.user?.school_id).first()

    if (!teacher) {
      return ctx.response.status(404).json({
        message: "Teacher not found"
      })
    }

    const trx = await db.transaction();
    try {

      const user = await User.create({
        teacher_id: payload.teacher_id,
        school_id: ctx.auth.user?.school_id,
        is_active: true,
        password: "12345678",
        role_id: 6,
        is_teacher: true,
        name: teacher.first_name + " " + teacher.last_name,
        saral_email: `${teacher.first_name.toLowerCase()}-${teacher.last_name.toLowerCase()}@${teacher.school.branch_code}.saral`
      }, { client: trx });

      if (payload.class_id) {
        const clas = await Classes
          .query()
          .where('id', payload.class_id)
          .andWhere('school_id', ctx.auth.user!.school_id)
          .first();

        if (!clas) {
          return ctx.response.status(404).json({
            message: "Class not found"
          });
        }

        clas.useTransaction(trx); // 👈 Use transaction first
        await clas.merge({ is_assigned: true }).save();

        teacher.useTransaction(trx); // 👈 Use transaction first
        await teacher.merge({ class_id: payload.class_id }).save();
      }

      await trx.commit();
      return ctx.response.json(user.serialize());

    } catch (error) {
      console.log("error", error.message);
      await trx.rollback();
      return ctx.response.status(500).json({
        message: error.message
      });
    }
  }

  async UpdateOnBoardedTeacher(ctx: HttpContext) {


    const user_id = ctx.params.user_id;
    const trx = await db.transaction();
  
    try {
      // ✅ Authorization check
      if (ctx.auth.user!.role_id !== 1) {
        return ctx.response.status(401).json({
          message: "You are not authorized to perform this action"
        });
      }
  
      // ✅ Fetch User
      const user = await User.query()
        .where('id', user_id)
        .andWhere('school_id', ctx.auth.user!.school_id)
        .first()
  
      if (!user) {
        return ctx.response.status(404).json({ message: "User not found" });
      }
      
      // ✅ Validate Input
      const payload = await UpdateValidatorForOnBoardTeacherAsUser.validate(ctx.request.all());
  
      // ✅ If class_id is provided & user has a teacher_id, update teacher's class
      if (payload.class_id && user.teacher_id) {
        // Fetch Class
        const clas = await Classes.query()
          .where('id', payload.class_id)
          .andWhere('school_id', ctx.auth.user!.school_id)
          .first(); // 👈 Missing `.first()` fixed
  
        if (!clas) {
          return ctx.response.status(404).json({ message: "Class not found" });
        }
  
        // Fetch Teacher
        const teacher = await Teacher.query()
          .preload('school')
          .where('id', user.teacher_id)
          .andWhere('school_id', ctx.auth.user!.school_id)
          .first()
  
        if (!teacher) {
          return ctx.response.status(404).json({ message: "Teacher not found" });
        }
  
        // ✅ Update Teacher's Class
        teacher.useTransaction(trx);
        await teacher.merge({ class_id: payload.class_id }).save();
      }
  
      // ✅ Update User Status
      user.useTransaction(trx);
      await user.merge({ is_active: payload.is_active ?? user.is_active }).save();
  
      // ✅ Commit Transaction
      await trx.commit();
      return ctx.response.json(user.serialize());
  
    } catch (error) {
      await trx.rollback();
      return ctx.response.status(500).json({
        message: error.message
      });
    }
  }
  

  async update(ctx: HttpContext) {

    if (ctx.auth.user?.id !== 1 && ctx.auth.user?.id !== 2) {
      return ctx.response.status(404).json({ message: 'You are not authorized to perform this action' });
    }

    const payload = await UpdateValidatorForUsers.validate(ctx.request.all());

    const user = await Users.findOrFail(ctx.params.user_id);

    if (user.school_id !== ctx.auth.user?.school_id) {
      return ctx.response.status(404).json({ message: 'You are not authorized to perform this action' });
    }
    user.merge(payload).save();
    return ctx.response.json(user.serialize());
  }

}
