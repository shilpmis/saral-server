import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'other_staff_leave_balance'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      // table.integer('school_id').unsigned().references('id').inTable('schools')
      table.integer('other_staff_id').unsigned().references('id').inTable('other_staff')
      table.integer('leave_type_id').unsigned().references('id').inTable('leave_types_master')
      table.integer('academic_year').notNullable()
      table.decimal('total_leaves', 8, 1).notNullable()
      table.decimal('used_leaves', 8, 1).defaultTo(0)
      table.decimal('pending_leaves', 8, 1).defaultTo(0) // Leaves in approval state
      table.decimal('carried_forward', 8, 1).defaultTo(0)
      table.decimal('available_balance', 8, 1).notNullable()
      table.timestamp('last_updated')
      
      table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(this.now());
      table.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(this.now());
  
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}