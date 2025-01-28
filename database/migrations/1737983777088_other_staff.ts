import { BaseSchema } from '@adonisjs/lucid/schema'

export default class OtherStaff extends BaseSchema {
    protected tableName = 'other_staff'

    public async up () {
        this.schema.createTable(this.tableName, (table) => {
            table.bigIncrements('id')
            table.bigInteger('school_id').notNullable()
            table.bigInteger('role_id').notNullable()
            table.string('name').notNullable()
            table.string('email').notNullable()
            table.bigInteger('leave_status').notNullable()
        })
    }

    public async down () {
        this.schema.dropTable(this.tableName)
    }
}
