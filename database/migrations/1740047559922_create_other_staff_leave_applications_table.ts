import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'other_staff_leave_applications'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('uuid').unique();
      table.integer('other_staff_id').unsigned().references('id').inTable('other_staff')
      table.integer('leave_type_id').unsigned().references('id').inTable('leave_types_master')
      table.integer('applied_by').unsigned().references('id').inTable('users').nullable().defaultTo(null) // For clerk applications
      table.boolean('applied_by_self').defaultTo(true) 
      table.date('from_date').notNullable()
      table.date('to_date').notNullable()
      table.decimal('number_of_days', 8, 1).notNullable()
      table.text('reason').notNullable()
      table.enum('status', ['pending', 'approved', 'rejected', 'cancelled']).defaultTo('pending')
      table.boolean('is_half_day').defaultTo(false)
      table.enum('half_day_type', ['first_half', 'second_half' , 'none']).nullable()
      table.boolean('is_hourly_leave').defaultTo(false)
      table.integer('total_hour').nullable()
      table.json('documents').nullable() // Array of document URLs
      table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(this.now());
      table.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(this.now());
  
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}