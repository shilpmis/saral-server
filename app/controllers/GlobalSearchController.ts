import Students from '#models/Students'
import Staff from '#models/Staff'
import type { HttpContext } from '@adonisjs/core/http'

export default class GlobalSearchController {
  public async getStuentSearchResults({ auth, request, response }: HttpContext) {
    try {
      const school_id = auth.user?.school_id
      const {
        academic_session_id,
        name,
        gr_no,
        aadhar_no,
        primary_mobile,
        enrollment_code,
        detailed,
        enrollment_status,
      } = request.qs()

      if (!school_id || !academic_session_id) {
        return response.badRequest({ message: 'Invalid request: Missing required parameters.' })
      }

      const studentsQuery = Students.query().where('school_id', school_id)

      // Filter by student enrollment for the academic session
      studentsQuery.whereHas('academic_class', (enrollmentQuery) => {
        enrollmentQuery.where('academic_session_id', academic_session_id)
        
        // Optional filter by enrollment status if provided
        if (enrollment_status) {
          enrollmentQuery.where('status', enrollment_status)
        }
      })

      if (name) {
        studentsQuery.andWhere((query) => {
          query
            .whereILike('first_name', `%${name}%`)
            .orWhereILike('middle_name', `%${name}%`)
            .orWhereILike('last_name', `%${name}%`)
            .orWhereILike('father_name', `%${name}%`)
        })
      }

      if (gr_no) {
        studentsQuery.andWhere('gr_no', 'LIKE', `%${gr_no}%`)
      }

      if (aadhar_no) {
        studentsQuery.andWhere('aadhar_no', 'LIKE', `%${aadhar_no}%`)
      }

      if (primary_mobile) {
        studentsQuery.andWhere('primary_mobile', 'LIKE', `%${primary_mobile}%`)
      }

      if (enrollment_code) {
        studentsQuery.andWhere('enrollment_code', 'LIKE', `%${enrollment_code}%`)
      }

      if (detailed === 'true') {
        studentsQuery
          .preload('student_meta')
          .preload('fees_status', (query) => {
            query.where('academic_session_id', academic_session_id)
          })
          .preload('provided_concession', (query) => {
            query.where('academic_session_id', academic_session_id).preload('concession')
          })
          .preload('academic_class', (query) => {
            query.where('academic_session_id', academic_session_id)
              .select(['id', 'student_id', 'division_id', 'academic_session_id', 'status'])
              .preload('division', (query) => {
                query.preload('class')
              })
          })
      } else {
        studentsQuery.preload('academic_class', (query) => {
          query.where('academic_session_id', academic_session_id)
            .select(['id', 'student_id', 'division_id', 'academic_session_id', 'status'])
        })
      }

      const students = await studentsQuery

      return response.ok(students)
    } catch (error) {
      console.error('Error fetching student search results:', error)
      return response.internalServerError({ message: 'Internal server error' })
    }
  }

  public async getStaffSearchResults({ auth, request, response }: HttpContext) {
    try {
      const school_id = auth.user?.school_id
      const {
        academic_session_id,
        name,
        employee_code,
        aadhar_no,
        mobile_number,
        email,
        detailed,
        is_active,
        enrollment_status,
      } = request.qs()

      if (!school_id || !academic_session_id) {
        return response.badRequest({ message: 'Invalid request: Missing required parameters.' })
      }

      // Base query starting with Staff model filtered by school
      const staffQuery = Staff.query()
        .where('school_id', school_id)

      // Filter by staff enrollment for the academic session
      staffQuery.whereHas('enrollments', (enrollmentQuery) => {
        enrollmentQuery.where('academic_session_id', academic_session_id)
        
        // Optional filter by enrollment status if provided
        if (enrollment_status) {
          enrollmentQuery.where('status', enrollment_status)
        }
      })

      // Apply additional filters if provided
      if (name) {
        staffQuery.andWhere((query) => {
          query
            .whereILike('first_name', `%${name}%`)
            .orWhereILike('middle_name', `%${name}%`)
            .orWhereILike('last_name', `%${name}%`)
        })
      }

      if (employee_code) {
        staffQuery.andWhere('employee_code', 'LIKE', `%${employee_code}%`)
      }

      if (aadhar_no) {
        staffQuery.andWhere('aadhar_no', 'LIKE', `%${aadhar_no}%`)
      }

      if (mobile_number) {
        staffQuery.andWhere('mobile_number', 'LIKE', `%${mobile_number}%`)
      }

      if (email) {
        staffQuery.andWhere('email', 'LIKE', `%${email}%`)
      }

      if (is_active !== undefined) {
        staffQuery.andWhere('is_active', is_active === 'true')
      }

      // Always preload role type and enrollments for the specific academic session
      staffQuery.preload('role_type');
      
      // Preload enrollments filtered by academic session
      staffQuery.preload('enrollments', (query) => {
        query.where('academic_session_id', academic_session_id)
      });

      if (detailed === 'true') {
        staffQuery
          .preload('school')
          .preload('assigend_classes', (query) => {
            query.where('academic_session_id', academic_session_id)
              .preload('divisions', (divisionQuery) => {
                divisionQuery.preload('class')
              })
          });
      }

      const staff = await staffQuery

      return response.ok(staff)
    } catch (error) {
      console.error('Error fetching staff search results:', error)
      return response.internalServerError({ message: 'Internal server error' })
    }
  }
}
