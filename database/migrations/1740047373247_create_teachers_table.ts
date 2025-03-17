import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'teachers'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id') // Primary key

      table
        .integer('school_id')
        .unsigned()
        .references('id')
        .inTable('schools')
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
      table.string('middle_name', 100).notNullable();
      table.string('last_name', 100).notNullable()

      table.string('first_name_in_guj', 100).notNullable();
      table.string('middle_name_in_guj', 100).notNullable();
      table.string('last_name_in_guj', 100).notNullable();

      table.enum('gender', ['Male', 'Female']).notNullable()
      table.date('birth_date').notNullable() // Ensure age validation

      // Contact details
      table
        .bigInteger('mobile_number')
        .notNullable()

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
        .nullable()
        .defaultTo(null)

      table.date('joining_date').notNullable()

      table
        .enum('employment_status', ['Permanent', 'Trial_period', 'Resigned', 'Contact_base', 'Notice_Period'])
        .defaultTo('Permanent')

      table.bigInteger('aadhar_no').notNullable().unique();

      table.string('religiion', 50).notNullable();
      table.string('religiion_in_guj', 50).notNullable();

      table.string('caste', 100).notNullable();
      table.string('caste_in_guj', 100).notNullable();
      table.enum('category', ['ST', 'SC', 'OBC', 'OPEN']).notNullable();

      table.string('address', 100).notNullable();
      table.string('district', 100).notNullable();
      table.string('city', 100).notNullable();
      table.string('state', 100).notNullable();
      table.bigInteger('postal_code').notNullable().unsigned();

      table.string('bank_name', 100).notNullable();
      table.bigInteger('account_no').notNullable().unsigned().unique();
      table.string('IFSC_code', 15).notNullable();

      // Timestamps
      table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(this.now())
      table.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(this.now())
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}