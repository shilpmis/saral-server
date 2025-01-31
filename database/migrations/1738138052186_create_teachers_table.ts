import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'teachers'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id') // Primary key

      table
        .integer('school_id')
        .unsigned()
        .nullable()
        .references('id')
        .inTable('school')
        .onDelete('CASCADE')
        .defaultTo(null)

      table
        .integer('staff_role_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('staff_role_master')
        .onDelete('CASCADE')

      // Teacher details
      table.string('first_name', 100).notNullable()
      table.string('last_name', 100).notNullable()
      table.enum('gender', ['Male', 'Female']).notNullable()
      table.date('birth_date').notNullable() // Ensure age validation

      // Contact details
      table
        .string('mobile_number', 15)
        .notNullable()
        .unique()
        .checkRegex('/^[6-9]\\d{9}$/')

      table.string('email', 255).notNullable().unique()
      table.string('qualification', 255).notNullable()
      table.string('subject_specialization', 255).nullable()

      // Employment details
      table
        .integer('class_id')
        .unsigned()
        .references('id')
        .inTable('classes') // Optional: If teachers are assigned a class
        .onDelete('SET NULL') // If class is deleted, keep teacher record

      table.date('joining_date').notNullable()

      table
        .enum('employment_status', ['Permanent', 'Trial_period', 'Resigned', 'Contact_base', 'Notice_Period'])
        .defaultTo('Permanent')

      // Timestamps
      table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(this.now())
      table.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(this.now())
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}