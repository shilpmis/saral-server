import StudentEnrollments from '#models/StudentEnrollments'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class extends BaseSeeder {
  async run() {
    // Write your database queries inside the run method
    await StudentEnrollments.createMany([
      {
        id: 1,
        student_id: 1,
        academic_session_id: 2, 
        status: 'Pursuing',
        class_id : 1
      },
      {
        id: 2,
        student_id: 2,
        academic_session_id: 2, 
        status: 'Pursuing',
        class_id : 1
      },
      {
        id: 3,
        student_id: 3,
        academic_session_id: 2, 
        status: 'Permoted',
        class_id : 2
      },
      {
        id: 4,
        student_id: 4,
        academic_session_id: 2, 
        status: 'Permoted',
        class_id : 2
      },
      {
        id: 5,
        student_id: 3,
        academic_session_id: 1, 
        status: 'Permoted',
        class_id : 1
      },
      {
        id: 6,
        student_id: 4,
        academic_session_id: 1, 
        status: 'Permoted',
        class_id : 1
      },
      {
        id: 7,
        student_id: 1,
        academic_session_id: 1, 
        status: 'Failed',
        class_id : 1
      },
      {
        id: 8,
        student_id: 1,
        academic_session_id: 2, 
        status: 'Failed',
        class_id : 1
      },
    ])
  }
}