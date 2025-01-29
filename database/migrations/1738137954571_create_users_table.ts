import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
    protected tableName = 'users'

    public async up() {
        this.schema.createTable(this.tableName, (table) => {
            table.increments('id')
            table.integer('school_id').unsigned().references('id').inTable('school').onUpdate('CASCADE').onDelete('CASCADE');
            table.integer('role_id').unsigned().references('id').inTable('role_master').onUpdate('CASCADE').onDelete('CASCADE');
            table.string('name').notNullable()
            table.string('username').notNullable().unique();
            table.string('saral_email').notNullable().unique();
            table.string('password').notNullable();

            table.timestamp('created_at');
            table.timestamp('updated_at');
        })
    }

    public async down() {
        this.schema.dropTable(this.tableName)
    }
}
