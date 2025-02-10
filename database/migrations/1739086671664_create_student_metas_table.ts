import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'student_meta'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.bigInteger('secondary_mobile').nullable().defaultTo(null).alter({alterNullable: true});
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.integer('secondary_mobile').notNullable().unique();
    })
  }
}