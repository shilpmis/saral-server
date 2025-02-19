import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'other_staff'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
        
      table
      .bigInteger('mobile_number')
      .unique()
      .notNullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}