import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'academic_sessions'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('uuid', 50).notNullable().unique();

      table.integer('school_id')
        .unsigned()
        .notNullable()
        .references('schools')
        .inTable('academic_sessions')
        .onDelete('CASCADE');

      table.string('session_name', 50).notNullable();
      table.date('start_date').notNullable();
      table.date('end_date').notNullable();
      table.string('start_month').notNullable();
      table.string('end_month').notNullable();
      table.string('start_year').notNullable();
      table.string('end_year').notNullable();
      table.string('is_active').notNullable();

      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}