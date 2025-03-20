import type { HttpContext } from '@adonisjs/core/http';
import AdmissionInquiry from '#models/Inquiries';
import Students from '#models/Students';
import StudentEnrollments from '#models/StudentEnrollments';
import Quota from '#models/Quota';
import db from '@adonisjs/lucid/services/db';

export default class InquiriesController {
  
  /**
   * Fetch paginated admission inquiries for the logged-in user's school
   */
  async listAllInquiries(ctx: HttpContext) {
    const school_id = ctx.auth.user!.school_id;
    const page = ctx.request.input('page', 1);

    const inquiries = await AdmissionInquiry.query()
      .where('school_id', school_id)
      .orderBy('created_at', 'desc')
      .paginate(page, 6);

    return ctx.response.status(200).json(inquiries);
  }

  /**
   * Add a new admission inquiry
   */
  async addInquiryForClass(ctx: HttpContext) {
    const payload = ctx.request.all();
   console.log("payload",payload);
    const inquiry = await AdmissionInquiry.create({
      ...payload,
      created_by: ctx.auth.user!.id,
      school_id: ctx.auth.user!.school_id,
    });

    return ctx.response.status(201).json({
      message: 'Admission inquiry added successfully',
      inquiry,
    });
  }

  /**
   * Get a single admission inquiry by ID
   */
  async getInquiryById(ctx: HttpContext) {
    const inquiry = await AdmissionInquiry.findOrFail(ctx.params.id);

    return ctx.response.status(200).json(inquiry);
  }

  /**
   * Update an admission inquiry
   */
  async updateInquiry(ctx: HttpContext) {
    const payload = await ctx.request.all()

    const inquiry = await AdmissionInquiry.findOrFail(ctx.params.id);
    inquiry.merge(payload);
    await inquiry.save();

    return ctx.response.status(200).json({
      message: 'Admission inquiry updated successfully',
      inquiry,
    });
  }

  /**
   * Delete an admission inquiry
   */
  async destroy(ctx: HttpContext) {
    const inquiry = await AdmissionInquiry.findOrFail(ctx.params.id);
    await inquiry.delete();

    return ctx.response.status(200).json({
      message: 'Admission inquiry deleted successfully',
    });
  }

  /**
   * Convert an Admission Inquiry into a Student & Student Enrollment
   */
  public async convertInquiryToStudent({ params, response }: HttpContext) {
    const trx = await db.transaction();

    try {
      // Fetch Inquiry Data
      const inquiry = await AdmissionInquiry.findOrFail(params.id);
      
      if (inquiry.is_converted_to_student) {
        return response.badRequest({ error: 'This inquiry has already been converted into a student.' });
      }

      // Generate Unique Admission Number & Enrollment Code
      const admissionNumber = await this.generateAdmissionNumber();
      const enrollmentCode = `EN-${inquiry.school_id}-${Date.now()}`;

      // Create Student Record
      const student = await Students.create({
        school_id: inquiry.school_id,
        enrollment_code: enrollmentCode,
        admission_number: admissionNumber,
        first_name: inquiry.student_name,
        middle_name: '', // Can be updated later
        last_name: '', // Can be updated later
        gender: inquiry.gender === 'male' ? 'Male' : 'Female',
        birth_date: inquiry.dob,
        gr_no: await this.generateGrNo(),
        primary_mobile: Number(inquiry.parent_contact),
        father_name: inquiry.parent_name,
        mother_name: '', // Can be updated later
        roll_number: await this.generateRollNumber(inquiry.class_applying),
        aadhar_no: undefined, // Can be updated later
        is_active: true,
      }, { client: trx });

      // Determine Quota ID (if applicable)
      let quotaId = inquiry.applying_for_quota ? inquiry.quota_type : null;

      // Check if Quota is Available
      if (quotaId) {
        const quota = await Quota.find(quotaId);
        if (!quota) {
          quotaId = null; // Default to general category if quota is invalid
        }
      }

      // Create Student Enrollment Record
      await StudentEnrollments.create({
        student_id: student.id,
        class_id: inquiry.class_applying,
        academic_session_id: inquiry.academic_session_id,
        quota_id: quotaId ?? undefined,
        status: 'Admitted',
        remarks: 'Converted from Inquiry',
        type: 'New Admission',
      }, { client: trx });

      // Mark Inquiry as Converted
      inquiry.is_converted_to_student = true;
      await inquiry.save();

      // Commit Transaction
      await trx.commit();

      return response.status(201).json({
        message: 'Inquiry successfully converted into student record.',
        student,
      });

    } catch (error) {
      await trx.rollback();
      return response.internalServerError({ error: 'Error processing inquiry conversion', details: error.message });
    }
  }

  /**
   * Generate a Unique Admission Number
   */
  private async generateAdmissionNumber(): Promise<string> {
    const latestStudent = await Students.query().orderBy('id', 'desc').first();
    const lastAdmissionNumber = latestStudent && latestStudent.admission_number 
      ? parseInt(latestStudent.admission_number) 
      : 1000;
    return String(lastAdmissionNumber + 1);
  }

  /**
   * Generate a Unique General Register (GR) Number
   */
  private async generateGrNo(): Promise<number> {
    const latestStudent = await Students.query().orderBy('id', 'desc').first();
    return latestStudent ? latestStudent.gr_no + 1 : 1000;
  }

  /**
   * Generate a Roll Number for the Given Class
   */
  private async generateRollNumber(classId: number): Promise<number> {
    const studentsInClass = await StudentEnrollments.query()
      .where('class_id', classId)
      .count('* as total');
  
    // Ensure the count is retrieved properly
    const totalStudents = (studentsInClass[0] as unknown as { total: number })?.total || 0;
  
    return totalStudents + 1;
  }
  
}
