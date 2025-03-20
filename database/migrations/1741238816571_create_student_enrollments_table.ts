import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'student_enrollments'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      table.integer('academic_sessions_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('academic_sessions')
        .onDelete('CASCADE');

      table.integer('class_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('classes')
        .onDelete('CASCADE');

      table.integer('student_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('students')
        .onDelete('CASCADE');

      table.enum('status' , ['Permoted' , 'Failed' , 'Pursuing']).defaultTo('Pursuing')

      table.string('remarks', 255).nullable();
      
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}