import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'students'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {

      table.increments('id');
      table
        .integer('school_id')
        .unsigned()
        .references('id')
        .inTable('schools')
        .onDelete('CASCADE');

      table
        .integer('class_id')
        .unsigned()
        .references('id')
        .inTable('classes') // Assuming the parent table is `schools`
        .onDelete('CASCADE'); // Ensure cascading delete

      table.string('first_name', 100).notNullable();
      table.string('middle_name', 100).notNullable();
      table.string('last_name', 100).notNullable();

      table.string('first_name_in_guj', 100).notNullable();
      table.string('middle_name_in_guj', 100).notNullable();
      table.string('last_name_in_guj', 100).notNullable();

      table.enum('gender', ['Male', 'Female']).notNullable();
      table
        .integer('gr_no')
        .unsigned()
        .notNullable()

      table.date('birth_date').notNullable();

      // Contact details
      table
        .bigInteger('primary_mobile')
        .notNullable()

      table.string('father_name', 100).notNullable();
      table.string('father_name_in_guj', 100).notNullable();
      table.string('mother_name', 100).notNullable();
      table.string('mother_name_in_guj', 100).notNullable();

      table.integer('roll_number').nullable().defaultTo(null);

      table.bigInteger('aadhar_no').unsigned().notNullable().unique();

      table.boolean('is_active').notNullable().defaultTo(true);

      // Timestamps
      table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(this.now());
      table.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(this.now());
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
