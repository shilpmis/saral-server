import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'school'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      
      table.string('established_year').notNullable();
      table.enum('school_type', ['Public' , 'Private' , 'Charter']),
      table.string('address' , 255).nullable().defaultTo(null)
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}