import ClassTeacherMaster from '#models/ClassTeacherMaster'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class extends BaseSeeder {
  async run() {
    // Write your database queries inside the run method
    await ClassTeacherMaster.createMany([
      {
        id: 1,
        division_id: 1,
        staff_id: 1,
        academic_session_id: 2,
        status: 'Active',
      },
      {
        id: 2,
        division_id: 2,
        staff_id: 1,
        academic_session_id: 2,
        status: 'Active',
      },
    ])
  }
}
