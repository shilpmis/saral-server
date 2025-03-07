import Schools from '#models/Schools'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class extends BaseSeeder {
  async run() {
    // Write your database queries inside the run method
    await Schools.createMany([
      {
        "name": "Helping Hands School",
        "organization_id": 1,
        "email": "admin@helpinghands.edu",
        "established_year": "2015",
        "school_type": "Public",
        "contact_number": 9876543210,
        "address": "123, Charity Road, Social Welfare Nagar",
        "district": "XYZ",
        "is_email_verified" : false,
        "city": "Ahmedabad",
        "state": "Gujarat",
        "pincode": 380001,
        "status": "ACTIVE"
    }
    ])
  }
}