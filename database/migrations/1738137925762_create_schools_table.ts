import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
    protected tableName = 'school'

    public async up () {
        this.schema.createTable(this.tableName, (table) => {
            table.increments('id');
            table.string('name').notNullable();
            table.string('email').unique().notNullable();
            // table.string('password').notNullable();
            table.string('username').notNullable().unique();
            table.bigInteger('contact_number').unique().notNullable();
            table.enum('subscription_type',['FREE' , 'PREMIUM']).notNullable().defaultTo('FREE');
            table.date('subscription_start_date').notNullable();
            table.date('subscription_end_date').notNullable();
            table.boolean('is_email_verified').notNullable().defaultTo(false);
            table.enum('status', ['ACTIVE' , 'INACTIVE']).notNullable().defaultTo('ACTIVE');
            
            table.timestamp('created_at');
            table.timestamp('updated_at');
        })
    }

    public async down () {
        this.schema.dropTable(this.tableName)
    }
}
