import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'attendance_masters'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('school_id').unsigned().references('id').inTable('schools')
      table.integer('class_id').unsigned().references('id').inTable('classes')
      table.integer('teacher_id').unsigned().references('id').inTable('teachers')
      table.date('attendance_date').notNullable()
      table.boolean('is_holiday').defaultTo(false)
      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })

      // Indexes for better query performance
      table.index(['school_id', 'attendance_date'])
      table.index(['class_id', 'attendance_date'])
      table.unique(['class_id', 'attendance_date'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}