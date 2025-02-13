import User from '#models/User'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class extends BaseSeeder {
  async run() {
    // Write your database queries inside the run method

    await User.createMany([
      {
        id : 1,
        school_id : 1,
        saral_email : 'meet007@melzo.saral', 
        name : "Meet Mehta",
        username : "meet007",
        role_id : 1,
        password : "12345678"  
    }
    ])
  }
}