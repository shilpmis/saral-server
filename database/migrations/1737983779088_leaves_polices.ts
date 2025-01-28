import { BaseSchema } from '@adonisjs/lucid/schema'

export default class LeavesPolices extends BaseSchema {
    protected tableName = 'leaves_polices'

    public async up () {
        this.schema.createTable(this.tableName, (table) => {
            table.bigIncrements('id')
            table.bigInteger('staff_role_id').index().notNullable()
            table.string('type').notNullable()
            table.json('police').notNullable()
            table.json('police_meta').notNullable()
            table.string('batch').notNullable()
        })
    }

    public async down () {
        this.schema.dropTable(this.tableName)
    }
}
