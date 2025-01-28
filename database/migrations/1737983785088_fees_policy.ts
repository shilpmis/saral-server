import { BaseSchema } from '@adonisjs/lucid/schema'

export default class FeesPolicy extends BaseSchema {
    protected tableName = 'fees_policy'

    public async up () {
        this.schema.createTable(this.tableName, (table) => {
            table.bigIncrements('id')
            table.bigInteger('class_id').notNullable()
            table.json('fees_policy').notNullable()
            table.bigInteger('batch').notNullable()
        })
    }

    public async down () {
        this.schema.dropTable(this.tableName)
    }
}
