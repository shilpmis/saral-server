import StaffEnrollment from '#models/StaffEnrollment'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class extends BaseSeeder {
  async run() {
    // Write your database queries inside the run method
    await StaffEnrollment.createMany([
      {
        id: 1,
        staff_id: 1,
        academic_session_id: 2, 
        status: 'Retained',
        school_id : 1
      },
      {
        id: 2,
        staff_id: 2,
        academic_session_id: 1, 
        status : 'New-Joiner',
        school_id : 1
      }
    ])
  }
}