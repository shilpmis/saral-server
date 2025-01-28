import { BaseSchema } from '@adonisjs/lucid/schema'

export default class Teachers extends BaseSchema {
    protected tableName = 'Teachers'

    public async up () {
        this.schema.createTable(this.tableName, (table) => {
            table.bigIncrements('id')
            table.enu('role_id',['']).notNullable()
            table.bigInteger('school_id').notNullable()
            table.string('name').notNullable()
            table.string('email').notNullable()
            table.bigInteger('contact_number').notNullable()
            table.bigInteger('leave_status').notNullable()
        })
    }

    public async down () {
        this.schema.dropTable(this.tableName)
    }
}
