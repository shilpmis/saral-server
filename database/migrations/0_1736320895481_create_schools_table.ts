import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'school'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.string('name', 255).notNullable()
      table.string('short_name', 80).notNullable()
      table.string('email', 255).notNullable().unique()
      // table.string('password', 180).notNullable()
      table.string('address', 255).nullable()
      table.string('city', 255).notNullable()
      table.string('state', 255).notNullable()
      table.integer('pincode', 10).nullable()
      table.string('phone', 20)
      table.enum('subscription_type', ['FREE']).nullable().defaultTo('FREE');
      table.timestamp('subscription_start_date')
      table.timestamp('subscription_end_date')
      table.enum('status', ['ACTIVE', 'INACTIVE', 'PENDING', 'BLOCKED']).defaultTo('ACTIVE');
      table.boolean('is_email_verified').defaultTo(true)
      table.timestamp('created_at', { useTz: true }).notNullable()
      table.timestamp('updated_at', { useTz: true }).notNullable()

    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}