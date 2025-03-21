import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'academic_fees_masters'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.integer('academic_session_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('academic_sessions')
        .onDelete('CASCADE');
        
      table.integer('fees_type_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('fees_types')
        .onDelete('CASCADE');
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}