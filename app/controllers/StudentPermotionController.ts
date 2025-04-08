import type { HttpContext } from '@adonisjs/core/http'
import { schema } from '@adonisjs/validator'
import db from '@adonisjs/lucid/services/db'

import Division from '#models/Divisions'
import AcademicSession from '#models/AcademicSession'
import StudentEnrollments from '#models/StudentEnrollments'
import Students from '#models/Students'

export default class StudentPromotionController {
  /**
   * Fetch students eligible for promotion
   */
  public async getStudentsForPromotion(ctx : HttpContext) {
     try {
      const getSchema = schema.create({
        academic_session_id: schema.number(),
        division_id: schema.number.optional(),
        student_id: schema.number.optional(),
        status: schema.enum.optional(['drop', 'promoted', 'failed'] as const),
        search: schema.string.optional(),
        page: schema.number.optional(),
        limit: schema.number.optional(),
      })
  
      const payload = await ctx.request.validate({ schema: getSchema })
  
      const page = payload.page || 1
      const limit = payload.limit || 50
  
      const school_id = ctx.auth.user?.school_id
      const session = await AcademicSession.query()
        .where('id', payload.academic_session_id)
        .if(school_id !== undefined, (query) => query.andWhere('school_id', school_id!))
        .first()
      
      if (!session) {
        return ctx.response.badRequest({ success: false, message: 'Academic session not found' })
      }
      const division = await Division.query()
        .if(payload.division_id !== undefined, (query) => query.where('id', payload.division_id!))
        .first()

      if (payload.division_id && !division) {
        return ctx.response.badRequest({ success: false, message: 'Division not found' })
      }
      const student = await Students.query()
        .if(payload.student_id !== undefined, (query) => query.where('id', payload.student_id!))
        .if(school_id !== undefined, (query) => query.where('school_id', school_id!))
        .first()
      
      if (payload.student_id && !student) {
        return ctx.response.badRequest({ success: false, message: 'Student not found' })
      }
      if (payload.status && !['drop', 'promoted', 'failed'].includes(payload.status)) {
        return ctx.response.badRequest({ success: false, message: 'Invalid status' })
      }
      const query = StudentEnrollments.query()
        .where('academic_session_id', payload.academic_session_id)
        .if(payload.status, (q) => q.where('status', payload.status!))
        .preload('student', (query) => {
           query.preload('fees_status');
        })
        .preload('division', (query) => {
          query.preload('class')
        });
          
  
      if (payload.division_id) {
        query.andWhere('division_id', payload.division_id)
      }
  
      if (payload.student_id) {
        query.andWhere('student_id', payload.student_id)
      }
  
      if (payload.search) {
        const term = `%${payload.search}%`
        query.whereHas('student', (subQuery) => {
          subQuery.whereILike('name', term).orWhereILike('roll_number', term)
        })
      }
  
      const students = await query.paginate(page, limit)
  
      return ctx.response.ok({
        success: true,
        data: {
          students: students.all(),
          pagination: students.getMeta(),
        },
      })
     } catch (error) {
      console.log("error occured while fetching student for promotion", error);
      return ctx.response.internalServerError({ success: false, message: error.message })
     }
  }

  /**
   * Promote a single student
   */
  public async promote({ request, response, auth }: HttpContext) {
    const promotionSchema = schema.create({
      student_id: schema.number(),
      source_academic_session_id: schema.number(),
      source_division_id: schema.number(),
      target_academic_session_id: schema.number(),
      target_division_id: schema.number(),
      status: schema.enum(['promoted', 'failed'] as const),
      remarks: schema.string.optional(),
    })

    const payload = await request.validate({ schema: promotionSchema })
    const trx = await db.transaction()

    const school_id = auth.user?.school_id;
    // validate the student id in the student enrollment table
    const student = await Students.query()
      .where('id', payload.student_id)
      .if(school_id !== undefined, (query) => query.where('school_id', school_id!))
      .first()

    if (!student) {
      return response.badRequest({ message: 'Student not found or inactive' })
    }
    try {
      const [sourceSession, targetSession, sourceDivision, targetDivision] = await Promise.all([
        AcademicSession.query()
          .where('id', payload.source_academic_session_id)
          .if(school_id !== undefined, (query) => query.where('school_id', school_id!))
          .first(),
        AcademicSession.query()
          .where('id', payload.target_academic_session_id)
          .if(school_id !== undefined, (query) => query.where('school_id', school_id!))
          .first(),
        Division.query()
          .where('id', payload.source_division_id)
          .first(),
        Division.query()
           .where('id', payload.target_division_id)
           .first(),
      ])

      if (!sourceSession) return response.badRequest({ message: 'Source session not found' })
      if (!targetSession) return response.badRequest({ message: 'Target session not found' })
      if (!sourceDivision) return response.badRequest({ message: 'Source division not found' })
      if (!targetDivision) return response.badRequest({ message: 'Target division not found' })

      const currentEnrollment = await StudentEnrollments.query({ client: trx })
      .where('student_id', payload.student_id)
      .andWhere('academic_session_id', payload.source_academic_session_id)
      .andWhere('status', 'pursuing')
      .first()

      if (!currentEnrollment) {
        return response.badRequest({ message: 'Student not enrolled in source session' })
      } 

      const alreadyEnrolled = await StudentEnrollments.query({ client: trx })
        .where('student_id', payload.student_id)
        .andWhere('academic_session_id', payload.target_academic_session_id)
        .first()

      if (alreadyEnrolled) {
        return response.badRequest({ message: 'Already enrolled in target session' })
      }

      if (currentEnrollment) {
        currentEnrollment.status = payload.status === 'promoted' ? 'permoted' : payload.status
      } else {
        throw new Error('Current enrollment not found')
      }
      currentEnrollment.remarks = payload.remarks || ''
      currentEnrollment.promoted_by = auth.user!.id
      await currentEnrollment.save()

      const newEnrollment = new StudentEnrollments()
      newEnrollment.fill({
        student_id: payload.student_id,
        division_id: payload.target_division_id,
        academic_session_id: payload.target_academic_session_id,
        quota_id: currentEnrollment.quota_id,
        status: 'pursuing',
        remarks: payload.remarks || '',
        is_new_admission: false,
      })

      await newEnrollment.useTransaction(trx).save()
      await trx.commit()

      return response.ok({ success: true, data: newEnrollment })
    } catch (error) {
      console.log("error occured while promoting student", error)
      await trx.rollback()
      return response.badRequest({ message: error.message })
    }
  }

  /**
   * Bulk promotion of students
   */
  public async bulkPromote({ request, response, auth }: HttpContext) {
    const bulkSchema = schema.create({
      student_ids: schema.array().members(schema.number()),
      source_academic_session_id: schema.number(),
      target_academic_session_id: schema.number(),
      target_division_id: schema.number(),
      status: schema.enum(['promoted', 'failed'] as const),
      remarks: schema.string.optional(),
    })
  
    const payload = await request.validate({ schema: bulkSchema })
    const school_id = auth.user?.school_id;
    const trx = await db.transaction()
  
    const results: { success: number[]; failed: { student_id: number; reason: string }[] } = { success: [], failed: [] }
  
    try {
      const [targetSession, targetDivision] = await Promise.all([
        AcademicSession.query()
          .where('id', payload.target_academic_session_id)
          .if(school_id !== undefined, (q) => q.where('school_id', school_id as number))
          .first(),
        Division.find(payload.target_division_id),
      ])
  
      if (!targetSession) {
        return response.badRequest({ message: 'Target academic session not found or invalid for this school' })
      }
  
      if (!targetDivision) {
        return response.badRequest({ message: 'Target division not found' })
      }
  
      for (const student_id of payload.student_ids) {
        try {
          const student = await Students.query()
            .where('id', student_id)
            .if(school_id !== undefined, (q) => q.where('school_id', school_id!))
            .first()
  
          if (!student) {
            results.failed.push({ student_id, reason: 'Student not found or does not belong to this school' })
            continue
          }
  
          const currentEnrollment = await StudentEnrollments.query({ client: trx })
            .where('student_id', student_id)
            .andWhere('academic_session_id', payload.source_academic_session_id)
            .andWhere('status', 'pursuing')
            .first()
  
          if (!currentEnrollment) {
            results.failed.push({ student_id, reason: 'Student not enrolled in source academic session' })
            continue
          }
  
          const alreadyEnrolled = await StudentEnrollments.query({ client: trx })
            .where('student_id', student_id)
            .andWhere('academic_session_id', payload.target_academic_session_id)
            .first()
  
          if (alreadyEnrolled) {
            results.failed.push({ student_id, reason: 'Already enrolled in target academic session' })
            continue
          }
  
          // Update current enrollment
          currentEnrollment.status = payload.status === 'promoted' ? 'permoted' : payload.status
          currentEnrollment.remarks = payload.remarks || ''
          currentEnrollment.promoted_by = auth.user!.id
          await currentEnrollment.save()
  
          // Create new enrollment
          const newEnrollment = new StudentEnrollments()
          newEnrollment.fill({
            student_id,
            division_id: payload.target_division_id,
            academic_session_id: payload.target_academic_session_id,
            quota_id: currentEnrollment.quota_id,
            status: 'pursuing',
            remarks: payload.remarks || '',
            is_new_admission: false,
            promoted_by: auth.user?.id,
          })
  
          await newEnrollment.useTransaction(trx).save()
          results.success.push(student_id)
  
        } catch (err) {
          console.error(`Promotion failed for student_id ${student_id}:`, err.message)
          results.failed.push({ student_id, reason: 'Unexpected error occurred during promotion' })
        }
      }
  
      await trx.commit()
      return response.ok({ success: true, data: results })
    } catch (err) {
      await trx.rollback()
      console.error('Bulk promotion failed:', err)
      return response.internalServerError({ success: false, message: 'Bulk promotion failed. Please try again.' })
    }
  }
  
  

  /**
   * Get promotion history (optional filter by session)
   */
  public async getPromotionHistory({ request, response }: HttpContext) {
    const sessionId = request.param('academic_session_id')
    console.log("sessionId for student ", sessionId);
  
    // Define the statuses to filter for
    const validStatuses = ['promoted', 'failed', 'drop', 'transfer'];
  
    try {
      const query = StudentEnrollments.query()
        .select(
          'student_id',
          'academic_session_id',
          'division_id',
          'status',
          'remarks',
          'promoted_at'
        )
        .whereIn('status', validStatuses)  // Filter by statuses
        .orderBy('promoted_at', 'desc')
  
      if (sessionId) {
        query.where('academic_session_id', sessionId)
      }
  
      const data = await query
        .preload('student', (query) => {
          query.preload('fees_status')
        })
        .preload('division')

      return response.ok({ success: true, data })
    } catch (error) {
      return response.internalServerError({ success: false, message: error.message })
    }
  }
  
}
