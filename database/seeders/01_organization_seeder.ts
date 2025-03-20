import Organization from '#models/organization'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class extends BaseSeeder {
  async run() {
    // Write your database queries inside the run method
    await Organization.createMany([
      {
        name: "Helping Hands Trust",
        email: "contactus@helpinghands.org",
        contact_number: 9896543710,
        subscription_type: "PREMIUM",
        subscription_start_date: new Date("2025-03-07"),
        subscription_end_date: new Date("2026-03-07"),
        is_email_verified: true,
        status: "ACTIVE",
        organization_logo: "https://example.com/trust-logo.png",
        established_year: "2010",
        address: "123, Charity Road, Social Welfare Nagar",
        head_name: "Mr. Ramesh Gupta",
        head_contact_number: 9876543811,
        district: "XYZ",
        city: "Ahmedabad",
        state: "Gujarat",
      }
    ])
  }
}