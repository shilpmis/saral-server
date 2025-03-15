import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'concessions'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
        table.enum('category' , ['Family', 'Sports' , 'Staff' , 'Education' , 'Financial', 'Other']).notNullable();
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}