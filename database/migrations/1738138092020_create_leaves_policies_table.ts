import { BaseSchema } from '@adonisjs/lucid/schema'

export default class  extends BaseSchema {
    protected tableName = 'leaves_polices'

    public async up () {
        this.schema.createTable(this.tableName, (table) => {
            table.integer('id')
            table.integer('staff_role_id').unsigned().references('id').inTable('staff_role_master').onUpdate('CASCADE').onDelete('CASCADE');            
            table.string('leave_type').notNullable()
            table.json('police').notNullable()
            table.json('police_meta').notNullable()
            table.string('batch').notNullable()
        })
    }

    public async down () {
        this.schema.dropTable(this.tableName)
    }
}
