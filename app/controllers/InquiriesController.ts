import type { HttpContext } from '@adonisjs/core/http'
import AdmissionInquiry from '#models/Inquiries'
import Students from '#models/Students'
import StudentEnrollments from '#models/StudentEnrollments'
import Quota from '#models/Quota'
import db from '@adonisjs/lucid/services/db'
import { CreateValidatorForInquiry, UpdateValidatorForInquiry } from '#validators/Inquiry'
import AcademicSession from '#models/AcademicSession'
import ClassSeatAvailability from '#models/ClassSeatAvailability'
import { CreateValidatorStundet } from '#validators/Stundets'
import QuotaAllocation from '#models/QuotaAllocation'
import StudentMeta from '#models/StudentMeta'
export default class InquiriesController {
  /**
   * Fetch paginated admission inquiries for the logged-in user's school
   */
  async listAllInquiries(ctx: HttpContext) {
    const school_id = ctx.auth.user!.school_id
    const page = ctx.request.input('page', 1)
    const academic_session_id = ctx.request.input('academic_session', null)
    if (!academic_session_id) {
      return ctx.response.status(400).json({
        message: 'Academic session ID is required',
      })
    }
    const inquiries = await AdmissionInquiry.query()
      .where('school_id', school_id)
      .andWhere('academic_session_id', academic_session_id)
      .orderBy('created_at', 'desc')
      .paginate(page, 10)

    return ctx.response.status(200).json(inquiries)
  }

  /**
   * Add a new admission inquiry
   */
  async addInquiryForClass(ctx: HttpContext) {
    try {
      // Validate the payload using the CreateValidatorForInquiry validator
      const payload = await CreateValidatorForInquiry.validate(ctx.request.all())

      let academicSession = await AcademicSession.query()
        .where('id', payload.academic_session_id)
        .andWhere('school_id', ctx.auth.user!.school_id)
        .first()

      if (!academicSession) {
        return ctx.response.status(400).json({
          message: 'Current academic session not found',
        })
      }

      let classSeatAvailability = await ClassSeatAvailability.query()
        .where('class_id', payload.inquiry_for_class)
        .andWhere('academic_session_id', payload.academic_session_id)
        .first()

      if (!classSeatAvailability) {
        return ctx.response.status(400).json({
          message:
            'Seat availability is not yet define for this class by admin for selected academic session',
        })
      }

      if (payload.applying_for_quota) {
        if (payload.quota_type === null) {
          return ctx.response.status(400).json({
            message: 'Quota type is required when applying for a quota',
          })
        }

        const quota = await Quota.query()
          .where('id', payload.quota_type)
          .andWhere('academic_session_id', payload.academic_session_id)
          .andWhere('school_id', ctx.auth.user!.school_id)
          .first()

        if (!quota) {
          return ctx.response.status(400).json({
            message: 'Quota not found',
          })
        }
      }

      if (!payload.applying_for_quota && payload.quota_type) {
        return ctx.response.status(400).json({
          message: 'Quota type should be null when not applying for a quota',
        })
      }

      const inquiry = await AdmissionInquiry.create({
        ...payload,
        created_by: ctx.auth.user!.id,
        school_id: ctx.auth.user!.school_id,
        // class_applying_for : payload.inquiry_for_class,
      })

      return ctx.response.status(201).json({
        message: 'Admission inquiry added successfully',
        inquiry,
      })
    } catch (error) {
      console.log('Error adding inquiry:', error)
      return ctx.response.status(400).json({
        message: 'Error adding inquiry',
        error: error,
      })
    }
  }

  /**
   * Update an admission inquiry
   */
  async updateInquiry(ctx: HttpContext) {
    const payload = await UpdateValidatorForInquiry.validate(ctx.request.all())

    const created_inquiry = await AdmissionInquiry.query()
      .where('id', ctx.params.id)
      .andWhere('school_id', ctx.auth.user!.school_id)
      .first()

    if (!created_inquiry) {
      return ctx.response.status(404).json({
        message: 'Inquiry not found',
      })
    }

    if (payload.inquiry_for_class) {
      let classSeatAvailability = await ClassSeatAvailability.query()
        .where('class_id', payload.inquiry_for_class)
        .andWhere('academic_session_id', created_inquiry.academic_session_id)
        .first()

      if (!classSeatAvailability) {
        return ctx.response.status(400).json({
          message:
            'Seat availability is not yet define for this class by admin for selected academic session',
        })
      }
    }

    if (payload.status && created_inquiry.is_converted_to_student) {
      return ctx.response.status(400).json({
        message: 'This inquiry has already been converted into a student.',
      })
    }

    created_inquiry.merge(payload)
    await created_inquiry.save()

    return ctx.response.status(200).json({
      message: 'Admission inquiry updated successfully',
      created_inquiry,
    })
  }

  /**
   * Get a single admission inquiry by ID
   */
  async getInquiryById(ctx: HttpContext) {
    const inquiry = await AdmissionInquiry.findOrFail(ctx.params.id)
    return ctx.response.status(200).json(inquiry)
  }

  /**
   * Delete an admission inquiry
   */
  // async destroy(ctx: HttpContext) {
  //   const inquiry = await AdmissionInquiry.findOrFail(ctx.params.id)
  //   await inquiry.delete()

  //   return ctx.response.status(200).json({
  //     message: 'Admission inquiry deleted successfully',
  //   })
  // }

  /**
   * Convert an Admission Inquiry into a Student & Student Enrollment
   */
  public async convertInquiryToStudent(ctx: HttpContext) {
    let school_id = ctx.auth.user!.school_id
    let inquiry_id = ctx.params.inquiry_id
    const trx = await db.transaction()

    try {
      // Fetch Inquiry Data
      const inquiry = await AdmissionInquiry.query()
        .where('id', inquiry_id)
        .andWhere('school_id', school_id)
        .first()

      if (!inquiry) {
        return ctx.response.notFound({
          error: 'Inquiry not found',
        })
      }

      if (inquiry.is_converted_to_student) {
        return ctx.response.badRequest({
          error: 'This inquiry has already been converted into a student.',
        })
      }

      // Generate Unique Admission Number & Enrollment Code
      // const admissionNumber = await this.generateAdmissionNumber()
      const enrollmentCode = `EN-${inquiry.school_id}-${Date.now()}`

      const payload = await CreateValidatorStundet.validate(ctx.request.body())

      // Create Student Record
      const student = await Students.create(
        {
          school_id: school_id,
          enrollment_code: enrollmentCode,
          admission_number: inquiry_id,
          gr_no: payload.students_data.gr_no,
          first_name: payload.students_data.first_name,
          middle_name: payload.students_data.middle_name,
          last_name: payload.students_data.last_name,
          first_name_in_guj: payload.students_data.first_name_in_guj,
          middle_name_in_guj: payload.students_data.middle_name_in_guj,
          last_name_in_guj: payload.students_data.last_name_in_guj,
          gender: payload.students_data.gender,
          birth_date: payload.students_data.birth_date,
          primary_mobile: payload.students_data.primary_mobile,
          father_name: payload.students_data.father_name,
          father_name_in_guj: payload.students_data.father_name_in_guj,
          mother_name: payload.students_data.mother_name,
          mother_name_in_guj: payload.students_data.mother_name_in_guj,
          roll_number: payload.students_data.roll_number,
          aadhar_no: payload.students_data.aadhar_no,
          is_active: true,
          // ...payload.students_data,
        },
        { client: trx }
      )

      await StudentMeta.create(
        {
          student_id: student.id,
          ...payload.student_meta_data,
        },
        { client: trx }
      )

      // Determine Quota ID (if applicable)
      let quotaId = inquiry.applying_for_quota ? inquiry.quota_type : null

      // Check if Quota is Available
      if (quotaId) {
        const quota_allocation = await QuotaAllocation.query()
          .where('quota_id', quotaId)
          .andWhere('class_id', inquiry.inquiry_for_class)
          .andWhere('academic_session_id', inquiry.academic_session_id)
          .first()

        if (!quota_allocation) {
          return ctx.response.badRequest({
            error: 'Quota Allocation for inquiry class is not yet defined by admin .',
          })
        }

        const clasSeatAvailability = await ClassSeatAvailability.query()
          .where('class_id', inquiry.inquiry_for_class)
          .andWhere('academic_session_id', inquiry.academic_session_id)
          .first()

        if (!clasSeatAvailability) {
          return ctx.response.badRequest({
            error: 'Class Seat Availability for inquiry class is not yet defined by admin .',
          })
        }

        quota_allocation.filled_seats += 1
        ;(await quota_allocation.save()).useTransaction(trx)

        clasSeatAvailability.merge({
          filled_seats: (clasSeatAvailability.filled_seats += 1),
          quota_allocated_seats: (clasSeatAvailability.quota_allocated_seats -= 1),
          remaining_seats: (clasSeatAvailability.remaining_seats -= 1),
        })
        ;(await clasSeatAvailability.save()).useTransaction(trx)
      }

      // Create Student Enrollment Record
      await StudentEnrollments.create(
        {
          student_id: student.id,
          division_id: payload.students_data.class_id,
          academic_session_id: inquiry.academic_session_id,
          quota_id: quotaId ?? null,
          status: 'pursuing',
          remarks: 'Converted from Inquiry',
          is_new_admission: true,
        },
        { client: trx }
      )

      // Mark Inquiry as Converted
      inquiry.is_converted_to_student = true
      inquiry.status = 'enrolled'
      await inquiry.save()

      // Commit Transaction
      await trx.commit()

      return ctx.response.status(201).json({
        message: 'Inquiry successfully converted into student record.',
        student,
      })
    } catch (error) {
      console.log('Error converting inquiry to student:', error)
      await trx.rollback()
      return ctx.response.internalServerError({
        error: 'Error processing inquiry conversion',
        details: error.message,
      })
    }
  }

  /**
   * Generate a Unique Admission Number
   */
  private async generateAdmissionNumber(): Promise<string> {
    const latestStudent = await Students.query().orderBy('id', 'desc').first()
    const lastAdmissionNumber =
      latestStudent && latestStudent.admission_number
        ? parseInt(latestStudent.admission_number)
        : 1000
    return String(lastAdmissionNumber + 1)
  }

  /**
   * Generate a Unique General Register (GR) Number
   */
  // private async generateGrNo(): Promise<number> {
  //   const latestStudent = await Students.query().orderBy('id', 'desc').first()
  //   return latestStudent ? latestStudent.gr_no + 1 : 1000
  // }

  // /**
  //  * Generate a Roll Number for the Given Class
  //  */
  // private async generateRollNumber(classId: number): Promise<number> {
  //   const studentsInClass = await StudentEnrollments.query()
  //     .where('class_id', classId)
  //     .count('* as total')

  //   // Ensure the count is retrieved properly
  //   const totalStudents = (studentsInClass[0] as unknown as { total: number })?.total || 0

  //   return totalStudents + 1
  // }
}
