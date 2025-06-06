import Classes from '#models/Classes'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class extends BaseSeeder {
  async run() {
    // Write your database queries inside the run method

    await Classes.createMany([
      {
        id: 1,
        class: '1',
        school_id: 1,
        academic_session_id: 1,
      },
      {
        id: 2,
        class: '2',
        school_id: 1,
        academic_session_id: 1,
      },
      {
        id: 3,
        class: '3',
        school_id: 1,
        academic_session_id: 1,
      },
      {
        id: 4,
        class: '4',
        school_id: 1,
        academic_session_id: 1,
      },
      {
        id: 5,
        class: '5',
        school_id: 1,
        academic_session_id: 1,
      },
      {
        id: 6,
        class: '6',
        school_id: 1,
        academic_session_id: 1,
      },
      {
        id: 7,
        class: '7',
        school_id: 1,
        academic_session_id: 1,
      },
      {
        id: 8,
        class: '8',
        school_id: 1,
        academic_session_id: 1,
      },
      {
        id: 9,
        class: '9',
        school_id: 1,
        academic_session_id: 1,
      },
      {
        id: 10,
        class: '10',
        school_id: 1,
        academic_session_id: 1,
      },
      {
        id: 11,
        class: '11',
        school_id: 1,
        academic_session_id: 1,
      },
      {
        id: 12,
        class: '12',
        school_id: 1,
        academic_session_id: 1,
      },
    ])
  }
}
