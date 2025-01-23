import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary();
      table.integer('school_id').unsigned().references('id').inTable('school').onDelete('CASCADE');
      table.string('saral_email', 255).notNullable().unique(); //auto-generated
      table.string('password', 180).notNullable();
      table.enum('role', ['admin', 'clerk', 'it_admin', 'principal']).notNullable();
      table.timestamp('last_login', { useTz: true }).notNullable();
      // table.string('username', 255).notNullable().unique();

      table.timestamp('created_at', { useTz: true }).notNullable()
      table.timestamp('updated_at', { useTz: true }).notNullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}