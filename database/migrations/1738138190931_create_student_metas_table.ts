import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'student_metas'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      table.bigInteger('aadhar_dise_no').notNullable().unique();

      table.string('birth_place', 50).notNullable();
      table.string('birth_place_in_guj', 50).notNullable();

      table.string('religiion', 50).notNullable();
      table.string('religiion_in_guj', 50).notNullable();

      table.string('cast', 100).notNullable();
      table.string('cast_in_guj', 100).notNullable();
      table.enum('category', ['ST', 'SC', 'OBC', 'OPEN']).notNullable();

      table.date('admission_date').notNullable();
      table.enum('admission_std', [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]).notNullable();
      table.enum('division', ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']).notNullable();

      table
        .string('mobile_number_2', 15)
        .unique()
        .notNullable()
        .checkRegex('/^[6-9]\d{9}$/'); // Ensures a valid mobile number


      table.string('privious_school', 100).nullable().defaultTo(null);
      table.string('privious_school_in_guj', 100).nullable().defaultTo(null);

      table.string('address', 100).notNullable();
      table.string('district', 100).notNullable();
      table.string('city', 100).notNullable();
      table.string('state', 100).notNullable();
      table.bigInteger('postal_code').notNullable().unsigned();

      table.string('bank_name', 100).notNullable();
      table.bigInteger('account_no').notNullable().unique().unsigned();
      table.string('IFSC_code', 15).notNullable().unique();


      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}