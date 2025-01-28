import { BaseSchema } from '@adonisjs/lucid/schema'

export default class PayrollPolices extends BaseSchema {
    protected tableName = 'payroll_polices'

    public async up () {
        this.schema.createTable(this.tableName, (table) => {
            table.bigIncrements('id')
            table.bigInteger('staff_role_id').notNullable()
            table.json('police').notNullable()
            table.json('police_meta').notNullable()
            table.string('batch').notNullable()
        })
    }

    public async down () {
        this.schema.dropTable(this.tableName)
    }
}
