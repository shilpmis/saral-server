import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'staff'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('school_id').unsigned().references('id').inTable('schools').onUpdate('CASCADE').onDelete('CASCADE')
      table.string('employee_code').notNullable().unique();
      table.boolean('is_active').defaultTo(true).notNullable();
      table.boolean('is_teaching_role').notNullable();
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

      table.string('first_name_in_guj', 100).nullable()
      table.string('middle_name_in_guj', 100).nullable()
      table.string('last_name_in_guj', 100).nullable()

      table.enum('gender', ['Male', 'Female']).notNullable()
      table.date('birth_date').notNullable()

      table.enum('marital_status', ['Single', 'Married', 'Divorced', 'Widowed']).nullable()

      // Contact Details
      table.bigInteger('mobile_number').notNullable()
      table.string('email', 255).nullable().unique()

      table.string('emergency_contact_name', 100).nullable()
      table.bigInteger('emergency_contact_number').nullable()

      // Qualification & Employment
      table.enum('qualification', [
        'D.Ed', 'B.Ed', 'M.Ed', 'B.A + B.Ed', 'B.Sc + B.Ed', 'M.A + B.Ed', 'M.Sc + B.Ed', 'Ph.D',
        'Diploma', 'B.Com', 'BBA', 'MBA', 'M.Com', 'ITI', 'SSC' , 'HSC' , 'Others'
      ]).nullable()

      table.enum('subject_specialization', [
        'Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'Hindi', 'Gujarati',
        'Social Science', 'Computer Science', 'Commerce', 'Economics',
        'Physical Education', 'Arts', 'Music', 'Others'
      ]).nullable()

      table.date('joining_date').nullable()

      table
        .enum('employment_status', ['Permanent', 'Trial_period', 'Resigned', 'Contract_base', 'Notice_Period'])
        .defaultTo('Permanent')

      table.integer('experience_years').unsigned().nullable()

      // Identification
      table.bigInteger('aadhar_no').notNullable().unique()
      table.string('pan_card_no', 10).nullable().unique()
      table.bigInteger('epf_no').nullable().unique()
      table.bigInteger('epf_uan_no').nullable().unique()

      table.enum('blood_group', ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-']).nullable()

      table.string('religion', 50).notNullable()
      table.string('religion_in_guj', 50).nullable()

      table.string('caste', 100).nullable()
      table.string('caste_in_guj', 100).nullable()
      table.enum('category', ['ST', 'SC', 'OBC', 'OPEN']).nullable()

      table.string('nationality', 50).defaultTo('Indian')

      // Address Details
      table.string('address', 255).nullable()
      table.string('district', 100).nullable()
      table.string('city', 100).nullable()
      table.string('state', 100).notNullable()
      table.bigInteger('postal_code').nullable().unsigned()

      // Bank Details
      table.string('bank_name', 100).nullable()
      table.bigInteger('account_no').nullable().unsigned().unique()
      table.string('IFSC_code', 15).nullable()

      // Profile Photo
      table.text('profile_photo').nullable()

      // Timestamps
      table.timestamp('created_at').defaultTo(this.now())
      table.timestamp('updated_at').defaultTo(this.now())
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
