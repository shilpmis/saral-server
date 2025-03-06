import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'schools'

  async up() {
    this.schema.createTable(this.tableName, (table) => {

      table.string('name').notNullable();
      table.string('email').unique().notNullable().unique();
      table.string('branch_code').notNullable().unique();
      table.bigInteger('contact_number').unique().notNullable();
      table.boolean('is_email_verified').notNullable().defaultTo(false);
      table.enum('status', ['ACTIVE', 'INACTIVE']).notNullable().defaultTo('ACTIVE');
      table.string('established_year').notNullable();
      table.enum('school_type', ['Public', 'Private', 'Charter']),
      table.string('address', 255).nullable().defaultTo(null)
      table.string('district', 100).notNullable();
      table.string('city', 100).notNullable();
      table.string('state', 100).notNullable();
      table.text('school_logo').nullable();
      table.bigInteger('pincode').unsigned().notNullable();
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}