import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropForeign('teacher_id')
      table.dropColumn('teacher_id') 
      table.integer('staff_id')
      .unsigned()
      .nullable()
      .references('id')
      .inTable('staff')
      .onDelete('CASCADE');
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}