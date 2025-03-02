import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'student_inquiries'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments("id").primary()
      table.string("student_name", 255).notNullable()
      table.string("parent_name", 255).notNullable()
      table.bigInteger("contact_number").notNullable()
      table.string("email", 255).nullable()
      table.integer("grade_applying").unsigned().notNullable()
      table.enum("status" , ['pendding' , 'rejected' , 'approved']).defaultTo('pendding')
      table.integer("created_by").unsigned().notNullable().references("id").inTable("users")
      table.text("admin_notes").nullable()
      table.boolean("is_converted_to_student").notNullable().defaultTo(false)

      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}