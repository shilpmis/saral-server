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
        name: "Admin",
        username: "admin-melzo",
        role_id: 1,
        password: "12345678",
      },
      {
        id: 2,
        school_id: 1,
        saral_email: 'principal@melzo.saral',
        name: "Meet Mehta",
        username: "principal-melzo",
        role_id: 2,
        password: "12345678",
      },
      {
        id: 3,
        school_id: 1,
        saral_email: 'rita-patel01@melzo.saral',
        name: "Rita Patel",
        username: "riatpatel",
        role_id: 6,
        password: "12345678",
        is_teacher : true,
        teacher_id : 2
      },
    ])
  }
}