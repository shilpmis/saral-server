import { BaseSchema } from "@adonisjs/lucid/schema";

export default class CreateClassSeatAvailabilityTable extends BaseSchema {
  protected tableName = 'class_seat_availabilities';

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary();
      table.integer('class_id').unsigned().notNullable().references('id').inTable('classes').onDelete('CASCADE');
      table.integer('quota_seat_allocated_id').unsigned().notNullable().references('id').inTable('quota_allocations').onDelete('CASCADE');

      table.integer('total_seats').notNullable();
      table.integer('quota_allocated_seats').notNullable().defaultTo(0);
      table.integer('general_available_seats').notNullable().defaultTo(0);
      table.integer('filled_seats').notNullable().defaultTo(0);
      table.integer('remaining_seats').notNullable().defaultTo(0);


      table.timestamps(true, true);
    });
  }

  public async down() {
    this.schema.dropTable(this.tableName);
  }
}
