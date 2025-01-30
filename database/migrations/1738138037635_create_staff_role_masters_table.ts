import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
    protected tableName = 'staff_role_master'

    public async up() {
        this.schema.createTable(this.tableName, (table) => {
            table.increments('id')
            table
                .integer('school_id')
                .unsigned()
                .notNullable()
                .references('id')
                .inTable('school')
                .onDelete('CASCADE')
            table.string('role' , 50).notNullable()
            table.json('permissions').notNullable()



        })
    }

    public async down() {
        this.schema.dropTable(this.tableName)
    }
}
