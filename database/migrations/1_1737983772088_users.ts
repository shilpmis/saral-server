import { RoleType } from '#enums/user.enum';
import { BaseSchema } from '@adonisjs/lucid/schema';

export default class Users extends BaseSchema {
  protected tableName = 'users';

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.integer('id'); // Primary key
      table.integer('school_id').unsigned().references('id').inTable('schools').onDelete('CASCADE').onUpdate('CASCADE')// Foreign key for 'Schools'
      table.string('name').notNullable(); // User's name
      table.string('username').notNullable(); // User's name
      table.string('saral_email').notNullable().unique(); // Unique email for Saral
      table.string('password').notNullable(); // Encrypted password
      table.enum('role', [RoleType]).notNullable(); // Enum for roles
      table.dateTime('last_login').nullable(); // Nullable last login timestamp
      
      // Add timestamps for created_at and updated_at
      table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(this.now());
      table.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(this.now());

    });
  }

  public async down() {
    this.schema.dropTable(this.tableName); // Drop the users table
  }
}
