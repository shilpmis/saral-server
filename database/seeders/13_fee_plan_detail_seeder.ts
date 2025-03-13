import FeesPlanDetails from '#models/FeesPlanDetails'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class extends BaseSeeder {
  async run() {
    // Write your database queries inside the run method
    await FeesPlanDetails.createMany([
      {
        id: 1,
        academic_year_id: 1,
        fees_plan_id: 1,
        fees_type_id: 1,
        installment_type: 'Admission',
        total_installment: 1,
        total_amount: 500.50,
      },
      {
        id: 2,
        academic_year_id: 1,
        fees_plan_id: 1,
        fees_type_id: 2,
        installment_type: 'Monthly',
        total_installment: 12,
        total_amount: 12000,
      },
      {
        id: 3,
        academic_year_id: 1,
        fees_plan_id: 1,
        fees_type_id: 3,
        installment_type: 'Half Yearly',
        total_installment: 2,
        total_amount: 1500,
      }
    ])
  }
}