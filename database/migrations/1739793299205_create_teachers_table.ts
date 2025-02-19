import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'teachers'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {

      table.string('middle_name', 100).notNullable();

      table.string('first_name_in_guj', 100).notNullable();
      table.string('middle_name_in_guj', 100).notNullable();
      table.string('last_name_in_guj', 100).notNullable();

      table.bigInteger('aadhar_no').notNullable();

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
      table.bigInteger('account_no').notNullable().unsigned();
      table.string('IFSC_code', 15).notNullable();

      table.unique(['aadhar_no'])
      table.unique(['account_no'])
      table.unique(['IFSC_code'])

    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}