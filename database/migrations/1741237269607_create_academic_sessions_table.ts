import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'academic_sessions'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      table.integer('school_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('schools')
        .onDelete('RESTRICT');

      table.string('session_name', 50).notNullable();
      table.date('start_date').notNullable().unique();
      table.date('end_date').notNullable().unique();
      table.string('start_month').notNullable().unique();
      table.string('end_month').notNullable().unique();
      table.string('start_year').notNullable().unique();
      table.string('end_year').notNullable().unique();
      table.string('is_active').notNullable();

      table.timestamp('created_at')
      table.timestamp('updated_at')
      table.unique(['school_id', 'start_year']) 
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}