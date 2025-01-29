import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
    protected tableName = 'other_staff'

    public async up() {
        this.schema.createTable(this.tableName, (table) => {
            table.increments('id')
            table.integer('school_id').unsigned().references('id').inTable('school').onUpdate('CASCADE').onDelete('CASCADE');
            table.integer('staff_role_id').unsigned().references('id').inTable('staff_role_master').onUpdate('CASCADE').onDelete('CASCADE');
            // Teacher details
            table.string('first_name', 100).notNullable();
            table.string('middle_name', 100).notNullable();
            table.string('last_name', 100).notNullable();
            table.enum('gender', ['Male', 'Female']).notNullable()
            table.date('birth_date').notNullable() // Ensure age validation
            table.string('email').notNullable()
            table.date('joining_date').notNullable()
            table.enum('employment_status', ['Active', 'Inactive', 'Resigned']).defaultTo('Active')

            // Timestamps
            table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(this.now())
            table.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(this.now())
        })
    }

    public async down() {
        this.schema.dropTable(this.tableName)
    }
}
