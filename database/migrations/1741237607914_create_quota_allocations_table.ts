import { BaseSchema } from "@adonisjs/lucid/schema";

export default class CreateQuotaAllocationsTable extends BaseSchema {
  protected tableName = 'quota_allocations';

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id');
      table.integer('quota_id').unsigned().references('id').inTable('quotas').onDelete('CASCADE');
      table.integer('class_id').unsigned().references('id').inTable('classes').onDelete('CASCADE');
      table.integer('total_seats').notNullable();
      table.integer('filled_seats').defaultTo(0);
      table.timestamps(true, true);
    });
  }

  public async down() {
    this.schema.dropTable(this.tableName);
  }
}
