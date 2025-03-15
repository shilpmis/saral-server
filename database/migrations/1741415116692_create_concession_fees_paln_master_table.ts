import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'concession_fees_paln_master'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('academic_year_id').unsigned().references('id').inTable('academic_years').onDelete('CASCADE');
      table.integer('concession_id').unsigned().references('id').inTable('concessions').onDelete('CASCADE');
      table.integer('fees_plan_id').unsigned().references('id').inTable('fees_plans').onDelete('CASCADE');
      table.integer('fees_type_id').unsigned().references('id').inTable('fees_types').onDelete('CASCADE').nullable();
      table.enum('deduction_type' , ['Percentage' , 'Fixed_Amount']).notNullable();
      table.decimal('amount', 10, 2).nullable();
      table.decimal('percentage', 10, 2).nullable();
      table.enum('status', ['Active', 'Inactive']).notNullable();
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}