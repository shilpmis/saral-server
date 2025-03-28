import FeesPlan from '#models/FeesPlan'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class extends BaseSeeder {
  async run() {
    // Write your database queries inside the run method
    await FeesPlan.createMany([
      {
        id: 1,
        division_id: 1,
        academic_session_id: 2,
        name: 'Fees Plan for Class 1',
        description: 'Fees Plan for Class 1',
        total_amount: 14000.5,
      },
      {
        id: 2,
        division_id: 2,
        academic_session_id: 2,
        name: 'Fees Plan for Class 2',
        description: 'Fees Plan for Class 2',
        total_amount: 0.0,
      },
    ])
  }
}
