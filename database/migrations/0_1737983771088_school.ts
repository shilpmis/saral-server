import { BaseSchema } from '@adonisjs/lucid/schema'

export default class School extends BaseSchema {
  protected tableName = 'school'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary() // Primary key
      table.string('name').notNullable()
      table.string('short_name').notNullable()
      table.string('email').unique().notNullable()
      table.string('password').notNullable()
      table.string('address').notNullable()
      table.string('city').notNullable()
      table.string('state').notNullable()
      table.string('short_key').notNullable()
      table.string('pincode').notNullable()
      table.bigInteger('contact_number').unique().notNullable()

      table
        .enu('subscription_type', ['FREE', 'PREMIUM'], {
          useNative: true,
          enumName: 'subscription_type_enum',
        })
        .notNullable()
        .defaultTo('FREE') // Default to FREE

      table
        .enu('status', ['PENDING', 'ACTIVE', 'INACTIVE', 'CANCELED'], {
          useNative: true,
          enumName: 'subscription_status_enum',
        })
        .notNullable()
        .defaultTo('PENDING') // Default to PENDING

      table.date('subscription_start_date').notNullable()
      table.date('subscription_end_date').notNullable()
      table.boolean('is_email_verified').notNullable().defaultTo(false) // Default to false
      table.timestamps(true, true) // Adds created_at and updated_at columns
    })
  }

  public async down() {
    // Drop enum types first, then the table
    this.schema.raw('DROP TYPE IF EXISTS subscription_type_enum')
    this.schema.raw('DROP TYPE IF EXISTS subscription_status_enum')
    this.schema.dropTable(this.tableName)
  }
}
