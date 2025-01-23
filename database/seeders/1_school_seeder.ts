import Schools from '#models/Schools'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class extends BaseSeeder {
  async run() {
    // Write your database queries inside the run method
    await Schools.createMany([
      {
        name: 'Melzo School',
        short_name : 'melzo',
        email: 'contatc@melzo.com',
        city: 'Surat',
        state: 'Guj',
        phone: 1234567890,
        subscription_type: 'FREE',
        subscription_start_date: '2025-01-15 08:05:32',
        subscription_end_date: '2025-01-15 08:05:32', 
        is_email_verified: true,
        address : '',
        pincode : 392010,
        status : 'ACTIVE',
      }
    ])
  }
}