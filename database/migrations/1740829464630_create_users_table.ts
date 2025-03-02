import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      // Drop the existing foreign key
      table.dropForeign(['teacher_id'])

      // Add the correct foreign key referencing the teachers table
      table.foreign('teacher_id').references('id').inTable('teachers').onUpdate('CASCADE').onDelete('CASCADE')
    })
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      // Drop the new foreign key (if rolling back)
      table.dropForeign(['teacher_id'])

      // Re-add the old incorrect foreign key
      table.foreign('teacher_id').references('id').inTable('schools').onUpdate('CASCADE').onDelete('CASCADE')
    })
  }
}