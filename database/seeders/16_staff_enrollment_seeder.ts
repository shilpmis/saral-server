import StaffEnrollment from '#models/StaffEnrollment'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class extends BaseSeeder {
  async run() {
    // Write your database queries inside the run method
    await StaffEnrollment.createMany([
      {
        id: 1,
        staff_id: 1,
        academic_sessions_id: 1, 
        status: 'Retained',
        school_id : 1
      },
      {
        id: 2,
        staff_id: 2,
        academic_sessions_id: 1, 
        status : 'Retained',
        school_id : 1
      }
    ])
  }
}