import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'classes'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('school_id').unsigned().references('id').inTable('school').onDelete('CASCADE');
      table.enum('class', [1, 2, 3, 4]).notNullable();
      table.enum('division', [1, 2, 3, 4]).notNullable();
      table.string('aliases' , 80).nullable();
      table.integer('total_students' , 80).nullable();
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}