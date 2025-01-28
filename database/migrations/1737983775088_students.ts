import { BaseSchema } from '@adonisjs/lucid/schema'

export default class Students extends BaseSchema {
    protected tableName = 'students'

    public async up () {
        this.schema.createTable(this.tableName, (table) => {
            table.bigIncrements('id')
            table.bigInteger('class_id').notNullable()
            table.bigInteger('school_id').notNullable()
            table.bigInteger('name').notNullable()
            table.bigInteger('email').notNullable()
            table.bigInteger('contact_number').notNullable()
        })
    }

    public async down () {
        this.schema.dropTable(this.tableName)
    }
}
