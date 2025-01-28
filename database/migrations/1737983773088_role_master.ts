import { BaseSchema } from '@adonisjs/lucid/schema'

export default class RoleMaster extends BaseSchema {
    protected tableName = 'role_master'

    public async up () {
        this.schema.createTable(this.tableName, (table) => {
            table.bigIncrements('id')
            table.string('role').notNullable()
            table.json('permissions').notNullable()
        })
    }

    public async down () {
        this.schema.dropTable(this.tableName)
    }
}
