import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'student_meta'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {

      table.dropColumn('admission_std');
      table.dropColumn('division');

      table
      .integer('admission_class_id')
      .unsigned()
      .references('id')
      .inTable('classes') 
      .onDelete('CASCADE'); 
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {

      table.string('admission_std');
      table.string('division');

      table.dropColumn('admission_class_id');
      
    })
  }
}