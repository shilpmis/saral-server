import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'staff_role_master'

  async up() {

    this.schema.alterTable(this.tableName, (table) => {
      table.boolean('is_teaching_role').notNullable();

      table.unique(['school_id', 'role'])
    })

  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}