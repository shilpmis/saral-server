import AcademicSession from '#models/AcademicSession'
import { HttpContext } from '@adonisjs/core/http'
import Schools from '#models/Schools'
import { DateTime } from 'luxon'

export default class AcademicSessionsController {
  public async createAcademicSessionForSchool(ctx: HttpContext) {
    try {
        // Extract start_date, end_date, and school_id from the request
        const { start_date, end_date, school_id } = ctx.request.only(['start_date', 'end_date', 'school_id'])

        // Ensure school_id is provided and is a positive integer
        if (!school_id || isNaN(school_id) || Number(school_id) <= 0) {
            return ctx.response.badRequest({ message: 'Invalid school ID' })
        }

        // Check if the school exists in the database
        const schoolExists = await Schools.find(school_id)
        if (!schoolExists) {
            return ctx.response.badRequest({ message: 'School not found' })
        }

        // Convert dates to DateTime objects
        const startDate = DateTime.fromISO(start_date).startOf('day')
        const endDate = DateTime.fromISO(end_date).startOf('day')
        const today = DateTime.now().startOf('day')

        // Ensure start_date is today or in the past
        if (startDate > today) {
            return ctx.response.badRequest({ message: 'Start date cannot be in the future' })
        }

        // Ensure end_date is after start_date
        if (endDate <= startDate) {
            return ctx.response.badRequest({ message: 'End date must be after start date' })
        }

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
            start_date: startDate.toJSDate(),
            end_date: endDate.toJSDate(),
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
      const sessions = await AcademicSession.query()
      .preload('school')
      .where('school_id', ctx.params.school_id)
      .orderBy('start_date', 'desc')
  
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
