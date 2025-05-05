import type { HttpContext } from '@adonisjs/core/http'
import Classes from '#models/Classes'
import {
  CreateManyValidatorForClasses,
  CreateValidatorForClasses,
  CreateValidatorForDivision,
  UpdateValidatorForClasses,
} from '#validators/Classes'
import Divisions from '#models/Divisions'
import AcademicSession from '#models/AcademicSession'
import db from '@adonisjs/lucid/services/db'
import { join } from 'node:path'

export default class ClassesController {
  async indexClassesForSchool(ctx: HttpContext) {
    let academicSession = await AcademicSession.query()
      .where('is_active', 1)
      .andWhere('school_id', ctx.auth.user!.school_id)
      .first()

    if (!academicSession) {
      return ctx.response.status(404).json({
        message: 'No active academic year found for this school',
      })
    }

    if (ctx.request.qs().without_fees_plan === 'true') {
      try {
        let class_for_School = await Classes.query().where('school_id', ctx.auth.user!.school_id)

        if (class_for_School.length === 0) {
          return ctx.response.status(404).json({
            message: 'No classes found for this school',
          })
        }

        let divisions = await db
          .query()
          .from('divisions as div')
          .select('div.*')
          .leftJoin('fees_plans as fp', 'div.id', 'fp.division_id')
          .andWhereIn('div.class_id', [...class_for_School.map((item) => item.id)])
          .andWhere((query) => {
            query
              .whereNull('fp.id') // No fees plan associated
              .orWhere('fp.status', 'Inactive') // Inactive fees plan
          })

        return ctx.response.json(divisions)
      } catch (error) {
        console.log('Error while fetching classes', error)
        return ctx.response.status(500).json({ message: error })
      }
    } else {
      let classes = await Classes.query()
        .preload('divisions')
        .where('school_id', ctx.auth.user!.school_id)
      // .where('academic_session_id', academicSession.id)
      return ctx.response.json(classes)

      /**
       * Edjust output object according to `
       */
      // if (classes.length > 0) {

      //   let output_obj: TypeForIndexSchoolClasses[] = [
      //     {
      //       class: 1,
      //       divisions: []
      //     },
      //     {
      //       class: 2,
      //       divisions: []
      //     },
      //     {
      //       class: 3,
      //       divisions: []
      //     },
      //     {
      //       class: 4,
      //       divisions: []
      //     },
      //     {
      //       class: 5,
      //       divisions: []
      //     },
      //     {
      //       class: 6,
      //       divisions: []
      //     },
      //     {
      //       class: 7,
      //       divisions: []
      //     },
      //     {
      //       class: 8,
      //       divisions: []
      //     },
      //     {
      //       class: 9,
      //       divisions: []
      //     },
      //     {
      //       class: 10,
      //       divisions: []
      //     },
      //     {
      //       class: 11,
      //       divisions: []
      //     },
      //     {
      //       class: 12,
      //       divisions: []
      //     },
      //   ];

      //   output_obj = output_obj.map((std: TypeForIndexSchoolClasses) => {
      //     // console.log("Check Classes" , [...classes])
      //     let divisions = [...classes].filter((item) => {
      //       return item.class == std.class
      //     })
      //     divisions.sort((a, b) => a.division.localeCompare(b.division))
      //     return { ...std, divisions: divisions }
      //   })
      //   return ctx.response.json(output_obj);
      // }
    }
  }

  async indexStandard(ctx: HttpContext) {
    if (ctx.params.school_id) {
      let classes = await Classes.query()
        .where('school_id', ctx.params.school_id)
        .andWhere('class', ctx.params.class)
      return ctx.response.json(classes)
    } else {
      return ctx.response.status(404).json({ message: 'Please provide valid Class ID.' })
    }
  }

  /**
   *
   * @param ctx
   * @returns
   *
   * this method will only create default class , which will create divition 'A' only
   */
  async createClass(ctx: HttpContext) {
    /**
     * TODO : Check for unique alise names of class , for perticular school
     */
    let school_id = ctx.auth.user?.school_id
    // const academic_session_id = ctx.auth.user?.academic_session_id;
    if (ctx.auth.user?.role_id !== 1) {
      return ctx.response
        .status(403)
        .json({ message: 'You are not allocated to manage this functions.' })
    }

    let trx = await db.transaction()

    try {
      const payload = await CreateValidatorForClasses.validate(ctx.request.body())
      const created_class = await Classes.create(
        { ...payload, school_id: school_id },
        { client: trx }
      )

      await Divisions.create(
        {
          class_id: created_class.id,
          division: 'A' as 'A',
          academic_session_id: payload.academic_session_id,
        },
        { client: trx }
      )
      await trx.commit()
      return ctx.response.json(created_class.serialize())
    } catch (error) {
      await trx.rollback()
      return ctx.response.status(500).json({ message: error })
    }
  }

  /**
   *
   * @param ctx
   * @returns
   *
   * this method will only create default class , which will create divition 'A' only
   */
  async createMultipleClasses(ctx: HttpContext) {
    /**
     * TODO : Check for unique alise names of class , for perticular school
     */
    let school_id = ctx.auth.user?.school_id

    if (ctx.auth.user?.role_id !== 1) {
      return ctx.response
        .status(403)
        .json({ message: 'You are not allocated to manage this functions.' })
    }
    let payload = await CreateManyValidatorForClasses.validate(ctx.request.body())
    let trx = await db.transaction()
    payload = payload.map((item) => {
      return { ...item, school_id: school_id }
    })
    try {
      const created_class = await Classes.createMany(payload, { client: trx })
      // cretae default division for each class
      let divisions = created_class.map((item) => {
        return {
          class_id: item.id,
          division: 'A' as 'A',
          academic_session_id: item.academic_session_id,
          aliases: null,
        }
      })
      await Divisions.createMany(divisions, { client: trx })
      await trx.commit()
      return ctx.response.json(created_class)
    } catch (error) {
      await trx.rollback()
      return ctx.response.status(500).json({ message: error })
    }
  }

  async updateClass(ctx: HttpContext) {
    let school_id = ctx.auth.user!.school_id
    if (ctx.auth.user?.role_id !== 1) {
      return ctx.response
        .status(403)
        .json({ message: 'You are not allocated to manage this functions.' })
    }
    const payload = await UpdateValidatorForClasses.validate(ctx.request.body())
    const divisioin_id = ctx.params.division_id
    const division = await Divisions.query().where('id', divisioin_id).first()

    if (!division) {
      return ctx.response.status(404).json({
        message: 'Please provide a valid division id',
      })
    }

    let cls = await Classes.query()
      .where('id', division.class_id)
      .andWhere('school_id', school_id)
      .first()

    if (!cls) {
      return ctx.response.status(404).json({
        message: 'This class is not belongs to your school.',
      })
    }

    division.merge(payload)
    await division.save()
    return ctx.response.json(division.serialize())
  }

  /**
   *
   * @param ctx
   * @returns
   *
   * method will create Division for class
   *
   * TODO :: Add automation code for create a plus one division only .
   *     ex : if there is division A and B are there , the next one should be C not D or any other .
   */
  async createDivision(ctx: HttpContext) {
    let school_id = ctx.auth.user!.school_id
    if (ctx.auth.user?.role_id !== 1) {
      return ctx.response
        .status(403)
        .json({ message: 'You are not allocated to manage this functions.' })
    }
    const payload = await CreateValidatorForDivision.validate(ctx.request.body())

    let academic_Session = await AcademicSession.query()
      .where('is_active', 1)
      .andWhere('school_id', school_id)
      .first()

    if (!academic_Session) {
      return ctx.response.status(404).json({
        message: 'No active academic year found for this school',
      })
    }

    if (academic_Session.id !== payload.academic_session_id) {
      return ctx.response
        .status(404)
        .json({ message: 'Please provide a valid academic session id' })
    }

    /**
     * Check it there a default class for this std , (ex for class 3-C , there should be a )
     */
    const created_division = await Divisions.create({ ...payload })
    return ctx.response.json(created_division.serialize())
  }
}
