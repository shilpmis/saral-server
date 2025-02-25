import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'school_meta'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('school_id').unsigned().references('id').inTable('schools').onUpdate('CASCADE').onDelete('CASCADE');
      table.string('head_name' , 100).notNullable();
      table.bigInteger('head_contact_number').unique().notNullable();
      table.string('address' , 100).notNullable();
      table.string('district' , 100).notNullable();
      table.string('city' , 100).notNullable();
      table.string('state' , 100).notNullable();
      table.bigInteger('pincode').unsigned().notNullable();

      table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(this.now());
      table.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(this.now());
  
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}