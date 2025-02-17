import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'teachers'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      
      // TODO : Fix this foriegn ket issue

      table.dropUnique(['mobile_number'] , 'teachers_mobile_number_unique')

      table
      .bigInteger('mobile_number')
      .unique()
      .notNullable()
      .alter({alterType : true})
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      
      table
      .integer('class_id')
      .unsigned()
      .references('id')
      .inTable('classes') // Optional: If teachers are assigned a class
      .onDelete('SET NULL') //;

      table
      .integer('mobile_number', 10)
      .notNullable()
      .unique()
      .checkRegex('/^[6-9]\\d{9}$/')

    })
  }
}