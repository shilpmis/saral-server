import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'concession_fees_paln_master'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumns('concession_type');
      
      table.enum('deduction_type' , ['percentage' , 'fixed_amount']).notNullable();

    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}