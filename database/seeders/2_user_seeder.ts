import User from '#models/User'
import { BaseSeeder } from '@adonisjs/lucid/seeders'
import { DateTime } from 'luxon'

export default class extends BaseSeeder {
  async run() {
    // Write your database queries inside the run method
    await User.createMany([
      {
        school_id: 1,
        password :'12345678',
        role : 'admin',
        saral_email : 'admin@melzo.com',
      },  
    ])
  }
}