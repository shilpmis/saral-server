import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'student_enrollments'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      table.integer('academic_session_id')
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
      
      table.integer('quota_id')
      .unsigned()
      .references('id')
      .inTable('quotas')
      .onDelete('CASCADE');

      table.enum('status' , ['Admitted','Permoted' , 'Failed' , 'Pursuing']).defaultTo('Pursuing')

      table.string('remarks', 255).nullable();

      table.enum('type', ['New Admission', 'Existing Student']).notNullable();
      
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}