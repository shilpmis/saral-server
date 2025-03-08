// import { flags } from '@adonisjs/core/ace'
import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'classes'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.boolean('is_assigned').defaultTo(false) 
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}