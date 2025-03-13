import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'academic_years'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('school_id').unsigned().references('id').inTable('schools').onDelete('CASCADE')
      table.string('name', 100).notNullable()
      table.date('start_date').notNullable()
      table.date('end_date').notNullable()
      table.string('start_month').notNullable()
      table.string('end_month').notNullable()
      table.string('start_year').notNullable()
      table.string('end_year').notNullable()
      table.enum('status', ['Active', 'Inactive']).notNullable();
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}