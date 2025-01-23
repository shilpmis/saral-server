import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'students_metas'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      /**
       * 
       * Meta details  ---------------------------------
       *  
       * */
      table
        .integer('student_id')
        .unsigned()
        .references('id')
        .inTable('students')
        .onDelete('CASCADE');

      table.string('religion', 50).notNullable();
      table.string('birth_place', 100).notNullable();

      // Contact
      table
        .string('sms_number', 15)
        .nullable()
        .checkRegex('/^[6-9]\d{9}$/'); // Optional valid SMS number

      // Address details
      table.string('address', 255).notNullable();
      table.string('city', 100).notNullable();
      table.string('state', 100).notNullable();
      table.string('district', 100).notNullable();
      table
        .string('postal_code', 10)
        .notNullable()
        .checkRegex('/^\d{6}$/'); // Validates Indian postal code

      // Caste details
      table.string('cast', 100).notNullable();
      table.string('cast_description', 255).nullable();

      // Aadhaar details
      table
        .string('aadhaar_number', 12)
        .notNullable()
        .unique()
        .checkRegex('/^\d{12}$/'); // Aadhaar validation
      table
        .string('aadhaar_dias_number', 12)
        .nullable()
        .unique()
        .checkRegex('/^\d{12}$/'); // Optional Aadhaar Dias number

      // Medical details
      table.boolean('any_medical_allergy').notNullable().defaultTo(false);
      table.string('medical_allergy_type', 255).nullable(); // Nullable if no allergies

      // Parent/Guardian details
      table
        .string('father_mobile', 15)
        .notNullable()
        .checkRegex('/^[6-9]\d{9}$/'); // Validate father's mobile number
      table
        .string('mother_mobile', 15)
        .notNullable()
        .checkRegex('/^[6-9]\d{9}$/'); // Validate mother's mobile number
      table.string('father_occupation', 100).notNullable();
      table.string('mother_occupation', 100).notNullable();

      // Academic details
      table.boolean('eligibility_for_scholarship').defaultTo(false); // Fixed typo
      table.date('school_joining_date').notNullable();
      table.string('past_school', 255).nullable(); // Nullable if no past school

      table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(this.now());
      table.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(this.now());
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}