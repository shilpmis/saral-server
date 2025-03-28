import Students from '#models/Students'
import type { HttpContext } from '@adonisjs/core/http'

export default class GlobalSearchController {
  public async getStuentSearchResults({ auth, request, response }: HttpContext) {
    try {
      const school_id = auth.user?.school_id
      const { academic_session_id, name, gr_no, aadhar_no, primary_mobile, enrollment_code, detailed } = request.qs()

      if (!school_id || !academic_session_id) {
        return response.badRequest({ message: 'Invalid request: Missing required parameters.' })
      }

      const studentsQuery = Students.query().where('school_id', school_id)

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
            query.where('academic_session_id', academic_session_id).preload('class')
          })
      } else {
        studentsQuery.preload('academic_class', (query) => {
          query.where('academic_session_id', academic_session_id).preload('class')
        })
      }

      const students = await studentsQuery

      return response.ok(students)
    } catch (error) {
      console.error('Error fetching student search results:', error)
      return response.internalServerError({ message: 'Internal server error' })
    }
  }
}
