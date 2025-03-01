import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      
      table.unique(['teacher_id']);
      table.dropColumn('username');
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}