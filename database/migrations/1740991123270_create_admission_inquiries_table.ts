import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'admission_inquiries'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments("id").primary()

      table
        .integer('school_id')
        .unsigned()
        .references('id')
        .inTable('schools')
        .onDelete('CASCADE')

      // Student & Parent Details
      table.string("student_name", 255).notNullable()
      table.string("parent_name", 255).notNullable()
      table.bigInteger("contact_number").notNullable()
      table.bigInteger("parent_contact_number").notNullable()
      table.string("email", 255).nullable()
      
      // Application Details
      table.integer("grade_applying").unsigned().notNullable()
      table.enum("status", ['pending', 'rejected', 'approved']).defaultTo('pending')
      table.text("admin_notes").nullable()

      // Additional Inquiry Information
      table.enum("preferred_contact_method", ['Call', 'Email', 'SMS']).defaultTo('Call')
      table.enum("inquiry_source", ['Website', 'Walk-in', 'Referral', 'Social Media']).defaultTo('Website')

      // Address Details
      table.string("address", 255).nullable()
      table.string("city", 100).nullable()
      table.string("state", 100).nullable()
      table.bigInteger("postal_code").nullable().unsigned()

      // Created by (Admin User)
      table.integer("created_by").unsigned().notNullable().references("id").inTable("users")

      // Conversion Tracking
      table.boolean("is_converted_to_student").notNullable().defaultTo(false)

      // Timestamps
      table.timestamp('created_at').defaultTo(this.now())
      table.timestamp('updated_at').defaultTo(this.now())
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
