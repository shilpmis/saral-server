import FeesType from '#models/FeesType'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class extends BaseSeeder {
  async run() {
    // Write your database queries inside the run method
    await FeesType.createMany([
      {
        id : 1,
        school_id : 1,
        academic_sessions_id : 1,
        name : 'Admission Fee',
        description : 'AAdmission Fee',
      },
      {
        id : 2,
        school_id : 1,
        academic_sessions_id : 1,
        name : 'Tuition Fee',
        description : 'Tuition Fee',
      },
      {
        id : 3,
        school_id : 1,
        academic_sessions_id : 1,
        name : 'Activity Fee',
        description : 'Activity Fee',
      }
    ])
  }
}