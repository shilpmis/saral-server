import User from '#models/User'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class extends BaseSeeder {
  async run() {
    // Write your database queries inside the run method

    await User.createMany([
      {
        id: 1,
        school_id: 1,
        saral_email: 'admin@melzo.saral',
        name: 'Admin',
        role_id: 1,
        password: '12345678',
        is_active: true,
        staff_id: null,
      },
      {
        id: 2,
        school_id: 1,
        saral_email: 'principal@melzo.saral',
        name: 'Meet Mehta',
        role_id: 2,
        password: '12345678',
        is_active: true,
        staff_id: null,
      },
      {
        id: 3,
        school_id: 1,
        saral_email: 'rita-patel01@melzo.saral',
        name: 'Rita Patel',
        role_id: 6,
        password: '12345678',
        staff_id: 1,
        is_active: true,
      },
    ])
  }
}
