import AcademicYears from '#models/AcademicYears'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class extends BaseSeeder {
  async run() {
    // Write your database queries inside the run method
    await AcademicYears.createMany([
       {
        id : 1,
        school_id : 1,
        name : '2025-2026',
        start_date : new Date('2025-01-01'),
        end_date : new Date('2026-12-31'),
        start_month : 'January',
        end_month : 'December',
        start_year : '2025',
        end_year : '2026',
        status : 'Active'
       } 
    ])
  }
}