import { BaseSchema } from '@adonisjs/lucid/schema'

export default class Classes extends BaseSchema {
    protected tableName = 'classes'

    public async up () {
        this.schema.createTable(this.tableName, (table) => {
            table.bigIncrements('id')
            table.bigInteger('school_id').index().notNullable()
            table.integer('class').notNullable().unsigned()
            table.string('division').notNullable()
            table.bigInteger('aliases').notNullable()
        })
    }

    public async down () {
        this.schema.dropTable(this.tableName)
    }
}
