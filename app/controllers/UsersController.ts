import type { HttpContext } from '@adonisjs/core/http'
import {
  CreateValidatorForOnBoardTeacherAsUser,
  CreateValidatorForUsers,
  UpdateValidatorForOnBoardTeacherAsUser,
  UpdateValidatorForUsers,
} from '#validators/Users'
import Users from '#models/User'
import User from '#models/User'
import Schools from '#models/Schools'
import Classes from '#models/Classes'
import db from '@adonisjs/lucid/services/db'
import Staff from '#models/Staff'
import ClassTeacherMaster from '#models/Classteachermaster'
import AcademicSession from '#models/AcademicSession'
import Divisions from '#models/Divisions'

export default class UsersController {
  async indexSchoolUsers(ctx: HttpContext) {
    const page = ctx.request.input('page', 1)
    const type = ctx.request.input('type')
    if (type === 'teachers') {
      const users = await Users.query()
        .preload('staff', (query) => {
          query.preload('assigend_classes', (query) => {
            query.preload('divisions')
            query.where('status', 'Active')
          })
          query.select('id', 'first_name', 'last_name', 'middle_name') // Only fetching required staff fields
        })
        .where('role_id', 6)
        .andWhere('school_id', ctx.auth.user!.school_id)
        .paginate(page, 6)
      return ctx.response.json(users.serialize())
    }

    const users = await Users.query()
      .where('school_id', ctx.auth.user!.school_id)
      .andWhereNot('role_id', 6)
      .paginate(page, 6)
    return ctx.response.json(users.serialize())
  }

  async createUser(ctx: HttpContext) {
    try {
      let school_id = ctx.auth.user?.school_id

      const payload = await CreateValidatorForUsers.validate(ctx.request.all())

      const school = await Schools.findBy('id', school_id)

      if (
        payload.role_id !== 1 &&
        payload.role_id !== 2 &&
        payload.role_id !== 3 &&
        payload.role_id !== 4 &&
        payload.role_id !== 5
      ) {
        return ctx.response.status(404).json({
          message: 'Invalid role_id',
        })
      }

      let user_type =
        payload.role_id === 1
          ? 'admin'
          : payload.role_id === 2
            ? 'principal'
            : payload.role_id === 3
              ? 'head-teacher'
              : payload.role_id === 4
                ? 'clerk'
                : payload.role_id === 5
                  ? 'it-admin'
                  : 'default'

      if (ctx.auth.user?.role_id == 1) {
        const user = await User.create({
          ...payload,
          school_id: school_id,
          is_active: true,
          password: '12345678',
          saral_email: `${user_type}@${school?.branch_code}.saral`,
        })
        return ctx.response.json(user.serialize())
      } else {
        return ctx.response
          .status(404)
          .json({ message: 'You are not authorized to perorm this action' })
      }
    } catch (error) {
      return ctx.response.status(501).json({
        message: error,
      })
    }
  }

  async updateUser(ctx: HttpContext) {
    if (ctx.auth.user?.id !== 1 && ctx.auth.user?.id !== 2) {
      return ctx.response
        .status(404)
        .json({ message: 'You are not authorized to perform this action' })
    }

    const payload = await UpdateValidatorForUsers.validate(ctx.request.all())

    const user = await Users.findOrFail(ctx.params.user_id)

    if (user.school_id !== ctx.auth.user?.school_id) {
      return ctx.response
        .status(404)
        .json({ message: 'You are not authorized to perform this action' })
    }
    user.merge(payload).save()
    return ctx.response.json(user.serialize())
  }

  async onBoardStaffAsUser(ctx: HttpContext) {
    if (ctx.auth.user?.role_id !== 1) {
      return ctx.response.status(401).json({
        message: 'You are not authorized to perform this action',
      })
    }
    const payload = await CreateValidatorForOnBoardTeacherAsUser.validate(ctx.request.all())

    let acadamic_seesion = await AcademicSession.query()
      .where('is_active', true)
      .andWhere('school_id', ctx.auth.user!.school_id)
      .first()

    if (!acadamic_seesion) {
      return ctx.response.status(404).json({ message: 'Academic session not found' })
    }

    const staff = await Staff.query()
      .preload('school')
      .where('id', payload.staff_id)
      .andWhere('is_teching_staff', true)
      .andWhere('school_id', ctx.auth.user?.school_id)
      .first()

    if (!staff) {
      return ctx.response.status(404).json({
        message: 'Staff not found',
      })
    }

    const trx = await db.transaction()
    try {
      const user = await User.create(
        {
          staff_id: payload.staff_id,
          school_id: ctx.auth.user?.school_id,
          is_active: true,
          password: '12345678',
          role_id: 6,
          name: staff.first_name + ' ' + staff.last_name,
          saral_email: `${staff.first_name.toLowerCase()}-${staff.last_name.toLowerCase()}@${staff.school.branch_code}.saral`,
        },
        { client: trx }
      )

      if (payload.assign_classes) {
        for (const division_id of payload.assign_classes) {
          const clas = await Divisions.query().where('id', division_id).first()

          if (!clas) {
            return ctx.response.status(404).json({
              message: 'Class not found',
            })
          }

          // clas.useTransaction(trx)
          // await clas.merge({ is_assigned: true }).save()

          let already_assigned_class = await ClassTeacherMaster.query()
            .where('division_id', division_id)
            .andWhere('staff_id', staff.id)
            .first()

          if (already_assigned_class) {
            ;(await already_assigned_class.merge({ status: 'Active' }).save()).useTransaction(trx)
          } else {
            await ClassTeacherMaster.create(
              {
                academic_session_id: acadamic_seesion.id,
                division_id: division_id,
                staff_id: staff.id,
                status: 'Active',
              },
              { client: trx }
            )
          }
        }
      }
      await trx.commit()
      return ctx.response.json(user.serialize())
    } catch (error) {
      console.log('error', error.message)
      await trx.rollback()
      return ctx.response.status(500).json({
        message: error.message,
      })
    }
  }

  async UpdateOnBoardedStaff(ctx: HttpContext) {
    const user_id = ctx.params.user_id
    const trx = await db.transaction()

    try {
      // ✅ Authorization check
      if (ctx.auth.user!.role_id !== 1) {
        return ctx.response.status(401).json({
          message: 'You are not authorized to perform this action',
        })
      }

      const user = await User.query()
        .preload('staff')
        .where('id', user_id)
        .andWhere('school_id', ctx.auth.user!.school_id)
        .andWhereNotNull('staff_id')
        .first()

      if (!user) {
        return ctx.response.status(404).json({ message: 'User not found' })
      }

      let acadamic_seesion = await AcademicSession.query()
        .where('is_active', true)
        .andWhere('school_id', ctx.auth.user!.school_id)
        .first()

      if (!acadamic_seesion) {
        return ctx.response.status(404).json({ message: 'Academic session not found' })
      }

      const { assign_classes, unassign_classes, ...payload } =
        await UpdateValidatorForOnBoardTeacherAsUser.validate(ctx.request.all())

      if (assign_classes) {
        for (const division_id of assign_classes) {
          const clas = await Divisions.query().where('id', division_id).first()

          if (!clas) {
            return ctx.response.status(404).json({
              message: 'Class not found',
            })
          }

          let already_assigned_class = await ClassTeacherMaster.query()
            .where('division_id', division_id)
            .andWhere('staff_id', user.staff.id)
            .andWhere('academic_session_id', acadamic_seesion.id)
            .first()

          if (already_assigned_class) continue

          // clas.useTransaction(trx)
          // await clas.merge({ is_assigned: true }).save()

          await ClassTeacherMaster.create(
            {
              academic_session_id: acadamic_seesion.id,
              division_id: division_id,
              staff_id: user.staff.id,
              status: 'Active',
            },
            { client: trx }
          )
        }
      }

      if (unassign_classes) {
        for (const division_id of unassign_classes) {
          const clas = await Divisions.query().where('id', division_id).first()

          if (!clas) {
            return ctx.response.status(404).json({
              message: 'Class not found',
            })
          }

          // clas.useTransaction(trx)
          // await clas.merge({ is_assigned: false }).save()

          let already_assigned_class = await ClassTeacherMaster.query()
            .where('division_id', division_id)
            .andWhere('staff_id', user.staff.id)
            .andWhere('academic_session_id', acadamic_seesion.id)
            .first()

          if (already_assigned_class)
            (await already_assigned_class.merge({ status: 'Inactive' }).save()).useTransaction(trx)
        }
      }

      user.useTransaction(trx)
      await user.merge(payload).save()
      await trx.commit()
      return ctx.response.json(user.serialize())
    } catch (error) {
      await trx.rollback()
      return ctx.response.status(500).json({
        message: error.message,
      })
    }
  }
}
