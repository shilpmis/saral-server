import RoleMaster from '#models/RoleMaster'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class extends BaseSeeder {
  async run() {
    // Write your database queries inside the run method

    await RoleMaster.createMany([
      {
        id: 1,
        role: "ADMIN",
        permissions : {}
      },
      {
        id: 2,
        role: "PRINCIPAL",
        permissions : {}
      },
      {
        id: 3,
        role: "HEAD_TEACHER",
        permissions : {}
      },
      {
        id: 4,
        role: "CLERCK",
        permissions : {}
      },
      {
        id: 5,
        role: "IT_ADMIN",
        permissions : {}
      },
    ])
  }
}