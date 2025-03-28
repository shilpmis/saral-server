import Divisions from '#models/Divisions'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class extends BaseSeeder {
  async run() {
    // Write your database queries inside the run method

    await Divisions.createMany([
      {
        id: 1,
        division: 'A',
        class_id: 1,
        academic_session_id: 1,
        aliases: 'Ram',
      },
      {
        id: 2,
        class_id: 2,
        division: 'A',
        academic_session_id: 1,
      },
      {
        id: 3,
        class_id: 3,
        division: 'A',
        academic_session_id: 1,
      },
      {
        id: 4,
        class_id: 4,
        division: 'A',
        academic_session_id: 1,
      },
      {
        id: 5,
        class_id: 5,
        division: 'A',
        academic_session_id: 1,
      },
      {
        id: 6,
        class_id: 6,
        division: 'A',
        academic_session_id: 1,
      },
      {
        id: 7,
        class_id: 7,
        division: 'A',
        academic_session_id: 1,
      },
      {
        id: 8,
        class_id: 8,
        division: 'A',
        academic_session_id: 1,
      },
      {
        id: 9,
        class_id: 9,
        division: 'A',
        academic_session_id: 1,
      },
      {
        id: 10,
        class_id: 10,
        division: 'A',
        academic_session_id: 1,
      },
      {
        id: 11,
        class_id: 11,
        division: 'A',
        academic_session_id: 1,
      },
      {
        id: 12,
        class_id: 12,
        division: 'A',
        academic_session_id: 1,
      },
    ])
  }
}
