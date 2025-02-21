import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'student_meta'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      table.integer('student_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('students')
        .onDelete('CASCADE');

      table.bigInteger('aadhar_dise_no').notNullable().unique();

      table.string('birth_place', 50).notNullable();
      table.string('birth_place_in_guj', 50).notNullable();

      table.string('religiion', 50).notNullable();
      table.string('religiion_in_guj', 50).notNullable();

      table.string('caste', 100).notNullable();
      table.string('caste_in_guj', 100).notNullable();
      table.enum('category', ['ST', 'SC', 'OBC', 'OPEN']).notNullable();

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

      table.string('address', 100).notNullable();
      table.string('district', 100).notNullable();
      table.string('city', 100).notNullable();
      table.string('state', 100).notNullable();
      table.bigInteger('postal_code').notNullable().unsigned();

      table.string('bank_name', 100).notNullable();
      table.bigInteger('account_no').notNullable().unique().unsigned();
      table.string('IFSC_code', 15).notNullable();

      table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(this.now());
      table.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(this.now());
  
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}