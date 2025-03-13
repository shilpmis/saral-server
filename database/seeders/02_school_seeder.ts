import Schools from '#models/Schools'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class extends BaseSeeder {
  async run() {
    // Write your database queries inside the run method
    await Schools.createMany([
      {
        id : 1,
        name: 'Melzo High School',
        email: 'contact@springfieldhigh.edu',
        established_year: '1995',
        school_type: 'Public',
        username: 'melzo',
        contact_number: 1234567890,
        address: '742 Evergreen Terrace, Springfield',
        subscription_type: 'FREE',
        subscription_start_date: new Date('2024-01-01'),
        subscription_end_date: new Date('2024-12-31'),
        is_email_verified: true,
        status: 'ACTIVE',
      },
      {
        id : 2,
        name: 'Riverdale Academy',
        email: 'info@riverdaleacademy.com',
        established_year: '2005',
        school_type: 'Private',
        username: 'riverdale_academy',
        contact_number: 9876543210,
        address: '123 Maple Street, Riverdale',
        subscription_type: 'PREMIUM',
        subscription_start_date: new Date('2024-02-01'),
        subscription_end_date: new Date('2025-01-31'),
        is_email_verified: false,
        status: 'INACTIVE',
      },
    ])
  }
}