import StaffMaster from '#models/StaffMaster'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class extends BaseSeeder {
  async run() {
    // Write your database queries inside the run method

    await StaffMaster.createMany([
      {
        id : 1,
        school_id : 1,
        role : 'Principal',
        is_teaching_role : true,
        permissions : {}  
      },
      {
        id : 2,
        school_id : 1,
        role : 'Head-Teacher',
        is_teaching_role : true,
        permissions : {}
      },
      {
        id : 3,
        school_id : 1,
        role : 'Teacher',
        is_teaching_role : true,
        permissions : {}
      },
      {
        id : 4,
        school_id : 1,
        role : 'Clerk',
        is_teaching_role : false,
        permissions : {}
      },
      {
        id : 5,
        school_id : 1,
        role : 'Peon',
        is_teaching_role : false,
        permissions : {}
      },
      {
        id : 6,
        school_id : 1,
        role : 'Accountant',
        is_teaching_role : false,
        permissions : {}
      },
    ]) // Creates two rows in the
  }
}