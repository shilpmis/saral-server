import AcademicSession from '#models/AcademicSession'
import SchoolTimeTableConfig from '#models/SchoolTimeTableConfig'
import { CreateValidatorForSchoolTimeTableConfig } from '#validators/TimeTable'
import type { HttpContext } from '@adonisjs/core/http'

export default class TimeTableController {

  async getSchoolTimeTableConfig(ctx: HttpContext) {

    let academic_session_id = ctx.request.input('academic_session_id')

    let academic_session = await AcademicSession
      .query()
      .where('id', academic_session_id)
      .andWhere('school_id', ctx.auth.user!.school_id)
      .first()

    if (!academic_session) {
      return ctx.response.badRequest({ message: 'Academic session not found' })
    }

    let school_timetable_config = await SchoolTimeTableConfig
      .query()
      .where('academic_session_id', academic_session_id)
      .first()

    if (!school_timetable_config) {
      return ctx.response.notFound({ message: 'School Time Table Config not found' })
    }

    return ctx.response.json(school_timetable_config)
  }

  async createSchoolTimeTableConfig(ctx: HttpContext) {

    let payload = await CreateValidatorForSchoolTimeTableConfig.validate(ctx.request.all())

    let academic_session = await AcademicSession
      .query()
      .where('id', payload.academic_session_id)
      .andWhere('school_id', ctx.auth.user!.school_id)
      .first()

    if (!academic_session) {
      return ctx.response.badRequest({ message: 'Academic session not found' })
    }

    if (!academic_session.is_active) {
      return ctx.response.badRequest({ message: 'Academic session is not active' })
    }

    let school_timetable_config = await SchoolTimeTableConfig.create(payload);

    return ctx.response.status(201).json(school_timetable_config)

  }


  // async 

}



