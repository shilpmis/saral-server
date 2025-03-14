import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'student_metas'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      table.integer('student_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('students')
        .onDelete('CASCADE');

      table.bigInteger('aadhar_dise_no').nullable().unique();

      table.string('birth_place', 50).nullable();
      table.string('birth_place_in_guj', 50).nullable();

      table.string('religiion', 50).nullable();
      table.string('religiion_in_guj', 50).nullable();

      table.string('caste', 100).nullable();
      table.string('caste_in_guj', 100).nullable();
      table.enum('category', ['ST', 'SC', 'OBC', 'OPEN']).nullable();

      table.enum('residence_type' , ['DAY_SCHOLAR' , 'RESIDENTIAL' , 'SEMI_RESIDENTIAL']).nullable();

      table.enum('blood_group', ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-']).nullable();

      // table.json('sibling_details')  
      table.string('identification_mark' , 100).nullable()  

      table.date('admission_date').notNullable();

      table
      .integer('admission_class_id')
      .unsigned()
      .references('id')
      .inTable('classes') 
      .onDelete('CASCADE');

      table.bigInteger('secondary_mobile').nullable().defaultTo(null);

      table.string('privious_school', 100).nullable().defaultTo(null);
      table.string('privious_school_in_guj', 100).nullable().defaultTo(null);

      table.string('address', 100).nullable();
      table.string('district', 100).nullable();
      table.string('city', 100).nullable();
      table.string('state', 100).nullable();
      table.integer('postal_code').nullable().unsigned();

      table.string('bank_name', 100).nullable();
      table.bigInteger('account_no').nullable().unique().unsigned();
      table.string('IFSC_code', 15).nullable();

      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}