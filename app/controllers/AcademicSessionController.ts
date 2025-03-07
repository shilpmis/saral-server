import AcademicSession from '#models/AcademicSession'
import { v4 as uuidv4 } from 'uuid'
import { HttpContext } from '@adonisjs/core/http'

export default class AcademicSessionsController {
  public async createAcademicSessionForSchool(ctx: HttpContext) {
    try {
        const data = ctx.request.only([
          'school_id',
          'session_name',
          'start_date',
          'end_date',
          'start_month',
          'end_month',
          'start_year',
          'end_year',
          'is_active'
        ])
  
        const session = await AcademicSession.create({
          uuid: uuidv4(),
          ...data
        })
  
        return ctx.response.created({ message: 'Academic session created successfully', session })
      } catch (error) {
        return ctx.response.internalServerError({ message: 'Error creating academic session', error })
    }
  }

  public async updateAcademicSessionForSchool(ctx: HttpContext) {
    try {
        const data = ctx.request.only([
            'session_name',
            'start_date',
            'end_date',
            'start_month',
            'end_month',
            'start_year',
            'end_year',
            'is_active'
        ])

      const session = await AcademicSession.findOrFail(ctx.params.id)
      session.merge(data)
      await session.save()

      return ctx.response.ok({ message: 'Academic session updated successfully', session })
    } catch (error) {
      return ctx.response.internalServerError({ message: 'Error updating academic session', error })
    }
  }

  public async getAllSchoolsInAcademicSession(ctx: HttpContext) {
    try {
      const sessions = await AcademicSession.query().preload('school')
  
      if (sessions.length === 0) {
        return ctx.response.notFound({ message: 'No academic sessions found' })
      }
  
      return ctx.response.ok({ sessions })
    } catch (error) {
      console.error('Error fetching academic sessions:', error)
      return ctx.response.internalServerError({ message: 'Error fetching academic sessions', error })
    }
  }
  
}
