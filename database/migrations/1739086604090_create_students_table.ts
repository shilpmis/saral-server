import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'students'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {      
      table.bigInteger('primary_mobile').alter();
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.integer('primary_mobile').alter();
    })
  }
}