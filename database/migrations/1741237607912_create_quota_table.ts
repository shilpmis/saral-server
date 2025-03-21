import { BaseSchema } from "@adonisjs/lucid/schema";

export default class CreateQuotasTable extends BaseSchema {
  protected tableName = 'quotas';

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary();
      table.string('name').unique().notNullable();
      table.text('description').nullable();
      table.string('eligibility_criteria').nullable();
      table.timestamps(true, true);
    });
  }

  public async down() {
    this.schema.dropTable(this.tableName);
  }
}
