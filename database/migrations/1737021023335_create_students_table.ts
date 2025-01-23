import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'students'

  async up() {
    this.schema.createTable(this.tableName, (table) => {

      // basic details
      table.increments('id'); // Primary key
      table
        .integer('school_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('schools') // Assuming the parent table is `schools`
        .onDelete('CASCADE'); // Ensure cascading delete

      // Student details
      table.string('first_name', 100).notNullable();
      table.string('last_name', 100).notNullable();
      table.enum('gender', ['Male', 'Female']).notNullable();
      table
        .integer('gr_no')
        .unsigned()
        .notNullable()
        .unique(); // Ensuring unique GR numbers for each student

      table.date('birth_date').notNullable(); // Validate age
      
      // Contact details
      table
        .string('mobile_number', 15)
        .notNullable()
        .unique()
        .checkRegex('/^[6-9]\d{9}$/'); // Ensures a valid mobile number

      table.string('father_name', 100).notNullable();
      table.string('mother_name', 100).notNullable();
      table
        .integer('class_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('classes') // Assuming the parent table is `schools`
        .onDelete('CASCADE'); // Ensure cascading delete
      table.integer('roll_number').unsigned().notNullable();

      // Timestamps
      table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(this.now());
      table.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(this.now());
    });
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}