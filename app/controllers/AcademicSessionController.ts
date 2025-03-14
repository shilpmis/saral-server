import AcademicSession from '#models/AcademicSession'
import { HttpContext } from '@adonisjs/core/http'
import Schools from '#models/Schools'
import { DateTime } from 'luxon'

export default class AcademicSessionsController {

  public async createAcademicSessionForSchool(ctx: HttpContext) {
    try {
      // Extract start_date, end_date, and school_id from the request
      const { start_date, end_date } = ctx.request.only(['start_date', 'end_date'])

      let school_id = ctx.auth.user?.school_id;
      if (ctx.auth.user?.role_id !== 1) {
        return ctx.response.unauthorized({ message: 'Unauthorized' })
      }

      // Check if the school exists in the database
      const schoolExists = await Schools.find(school_id)
      if (!schoolExists) {
        return ctx.response.badRequest({ message: 'School not found' })
      }

      // Convert dates to DateTime objects
      const startDate = DateTime.fromISO(start_date)
      const endDate = DateTime.fromISO(end_date)
      const today = DateTime.now()

      // Ensure start_date is today or in the past
      if (startDate > today) {
        return ctx.response.badRequest({ message: 'Start date cannot be in the future' })
      }

      // Ensure end_date is after start_date
      if (endDate <= startDate) {
        return ctx.response.badRequest({ message: 'End date must be after start date' })
      }

      // // Ensure the academic session is within the current year
      // if (startDate.year !== today.year || endDate.year !== today.year) {
      //   return ctx.response.badRequest({ message: 'Academic session must be within the current year' })
      // }

      // Calculate duration in months
      const durationInMonths = endDate.diff(startDate, 'months').months

      // Ensure session duration is between 10 and 12 months
      if (durationInMonths < 10 || durationInMonths > 12) {
        return ctx.response.badRequest({ message: 'Academic session must be between 10 to 12 months' })
      }

      // Generate session details dynamically
      const startMonth = startDate.toFormat('MMMM')
      const endMonth = endDate.toFormat('MMMM')
      const startYear = startDate.year.toString()
      const endYear = endDate.year.toString()

      // Create academic session
      const session = await AcademicSession.create({
        school_id,
        session_name: `${startYear}-${endYear}`,
        start_date: startDate,
        end_date: endDate,
        start_month: startMonth,
        end_month: endMonth,
        start_year: startYear,
        end_year: endYear,
        is_active: true
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

  public async getAllAcademicSessionInSchool(ctx: HttpContext) {
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
