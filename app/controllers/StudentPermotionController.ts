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

      currentEnrollment.status = payload.status === 'promoted' ? 'permoted' : payload.status
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
  // public async bulkPromote({ request, response, auth }: HttpContext) {
  //   const bulkSchema = schema.create({
  //     student_ids: schema.array().members(schema.number()),
  //     source_academic_session_id: schema.number(),
  //     target_academic_session_id: schema.number(),
  //     target_division_id: schema.number(),
  //     status: schema.enum(['promoted', 'failed'] as const),
  //     remarks: schema.string.optional(),
  //   })

  //   const payload = await request.validate({ schema: bulkSchema })
  //   const trx = await db.transaction()

  //   const results = { success: [], failed: [] }

  //   try {
  //     const [targetSession, targetDivision] = await Promise.all([
  //       AcademicSession.find(payload.target_academic_session_id),
  //       Division.find(payload.target_division_id),
  //     ])

  //     if (!targetSession) {
  //       return response.badRequest({ message: 'Target academic session not found' })
  //     }

  //     if (!targetDivision) {
  //       return response.badRequest({ message: 'Target division not found' })
  //     }

  //     for (const student_id of payload.student_ids) {
  //       try {
  //         const currentEnrollment = await StudentEnrollments.query({ client: trx })
  //           .where('student_id', student_id)
  //           .andWhere('academic_session_id', payload.source_academic_session_id)
  //           .andWhere('status', 'pursuing')
  //           .firstOrFail()

  //         const existing = await StudentEnrollments.query({ client: trx })
  //           .where('student_id', student_id)
  //           .andWhere('academic_session_id', payload.target_academic_session_id)
  //           .first()

  //         if (existing) {
  //           results.failed.push({ student_id, reason: 'Already enrolled in target session' })
  //           continue
  //         }

  //         currentEnrollment.status = payload.status
  //         currentEnrollment.updated_by = auth.user!.id
  //         currentEnrollment.remarks = payload.remarks || ''
  //         await currentEnrollment.save()

  //         const newEnrollment = new StudentEnrollments()
  //         newEnrollment.fill({
  //           student_id,
  //           division_id: payload.target_division_id,
  //           academic_session_id: payload.target_academic_session_id,
  //           quota_id: currentEnrollment.quota_id,
  //           status: 'pursuing',
  //           remarks: payload.remarks || '',
  //           is_new_admission: false,
  //           promoted_by: auth.user?.id,
  //           promoted_at: DateTime.now().toSQL(),
  //         })

  //         await newEnrollment.useTransaction(trx).save()
  //         results.success.push(student_id)
  //       } catch (err) {
  //         results.failed.push({ student_id, reason: err.message })
  //       }
  //     }

  //     await trx.commit()
  //     return response.ok({ success: true, data: results })
  //   } catch (err) {
  //     await trx.rollback()
  //     return response.internalServerError({ success: false, message: err.message })
  //   }
  // }

  /**
   * Get promotion history (optional filter by session)
   */
  public async getPromotionHistory({ request, response }: HttpContext) {
    const sessionId = request.input('academic_session_id')

    try {
      const query = db
        .from('student_enrollments')
        .select(
          'student_id',
          'academic_session_id',
          'division_id',
          'status',
          'remarks',
          'promoted_at'
        )
        .whereNotNull('promoted_at')
        .orderBy('promoted_at', 'desc')

      if (sessionId) {
        query.where('academic_session_id', sessionId)
      }

      const data = await query

      return response.ok({ success: true, data })
    } catch (error) {
      return response.internalServerError({ success: false, message: error.message })
    }
  }
}
