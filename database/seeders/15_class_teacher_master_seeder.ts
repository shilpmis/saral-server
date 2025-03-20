import ClassTeacherMaster from '#models/Classteachermaster'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class extends BaseSeeder {
  async run() {
    // Write your database queries inside the run method
    await ClassTeacherMaster.createMany([
      {
        id: 1,
        class_id: 1,
        staff_id: 1,
        academic_session_id: 1, 
        status: 'Active'
      },
      {
        id: 2,
        class_id: 2,
        staff_id: 1,
        academic_session_id: 1, 
        status: 'Active'
      }
    ])
  }
}