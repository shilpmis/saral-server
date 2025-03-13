import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'staff'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('employee_code').notNullable().unique();
      
      table
        .integer('staff_role_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('staff_role_master')
        .onDelete('CASCADE')

      // Personal Details
      table.string('first_name', 100).notNullable()
      table.string('middle_name', 100).notNullable()
      table.string('last_name', 100).notNullable()

      table.string('first_name_in_guj', 100).notNullable()
      table.string('middle_name_in_guj', 100).notNullable()
      table.string('last_name_in_guj', 100).notNullable()

      table.enum('gender', ['Male', 'Female']).notNullable()
      table.date('birth_date').notNullable()

      table.enum('marital_status', ['Single', 'Married', 'Divorced', 'Widowed']).notNullable()

      // Contact Details
      table.bigInteger('mobile_number').notNullable()
      table.string('email', 255).notNullable().unique()

      table.string('emergency_contact_name', 100).notNullable()
      table.bigInteger('emergency_contact_number').notNullable()

      // Qualification & Employment
      table.enum('qualification', [
        'D.Ed', 'B.Ed', 'M.Ed', 'B.A + B.Ed', 'B.Sc + B.Ed', 'M.A + B.Ed', 'M.Sc + B.Ed', 'Ph.D',
        'Diploma', 'B.Com', 'BBA', 'MBA', 'M.Com', 'ITI', 'SSC' , 'HSC' , 'Others'
      ]).notNullable()

      table.enum('subject_specialization', [
        'Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'Hindi', 'Gujarati',
        'Social Science', 'Computer Science', 'Commerce', 'Economics',
        'Physical Education', 'Arts', 'Music', 'Others'
      ]).nullable()

      table.date('joining_date').notNullable()

      table
        .enum('employment_status', ['Permanent', 'Trial_period', 'Resigned', 'Contract_base', 'Notice_Period'])
        .defaultTo('Permanent')

      table.integer('experience_years').unsigned().defaultTo(0).notNullable()

      // Identification
      table.bigInteger('aadhar_no').notNullable().unique()
      table.string('pan_card_no', 10).notNullable().unique()
      table.bigInteger('epf_no').nullable().unique()
      table.bigInteger('epf_uan_no').nullable().unique()

      table.enum('blood_group', ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-']).notNullable()

      table.string('religion', 50).notNullable()
      table.string('religion_in_guj', 50).notNullable()

      table.string('caste', 100).notNullable()
      table.string('caste_in_guj', 100).notNullable()
      table.enum('category', ['ST', 'SC', 'OBC', 'OPEN']).notNullable()

      table.string('nationality', 50).notNullable().defaultTo('Indian')

      // Address Details
      table.string('address', 255).notNullable()
      table.string('district', 100).notNullable()
      table.string('city', 100).notNullable()
      table.string('state', 100).notNullable()
      table.bigInteger('postal_code').notNullable().unsigned()

      // Bank Details
      table.string('bank_name', 100).notNullable()
      table.bigInteger('account_no').notNullable().unsigned().unique()
      table.string('IFSC_code', 15).notNullable()

      // Profile Photo
      table.string('profile_photo', 255).nullable()

      // Timestamps
      table.timestamp('created_at').defaultTo(this.now())
      table.timestamp('updated_at').defaultTo(this.now())
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
