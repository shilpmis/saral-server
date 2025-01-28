import { BaseSchema } from '@adonisjs/lucid/schema'

export default class Users extends BaseSchema {
    protected tableName = 'users'

    public async up () {
        this.schema.createTable(this.tableName, (table) => {
            table.bigIncrements('id')
            table.bigInteger('school_id').index().notNullable().unsigned()
            table.string('name').notNullable()
            table.string('saral_email').index().notNullable()
            table.string('password').notNullable()
            table.integer('role_id').notNullable()
        })
    }

    public async down () {
        this.schema.dropTable(this.tableName)
    }
}
