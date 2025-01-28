import { BaseSchema } from '@adonisjs/lucid/schema'

export default class StaffRoleMaster extends BaseSchema {
    protected tableName = 'staff_role_master'

    public async up () {
        this.schema.createTable(this.tableName, (table) => {
            table.bigIncrements('id')
            table.bigIncrements('school_id')
            table.string('role').notNullable()
            table.json('permissions').notNullable()
        })
    }

    public async down () {
        this.schema.dropTable(this.tableName)
    }
}
