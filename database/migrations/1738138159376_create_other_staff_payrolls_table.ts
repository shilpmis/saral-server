import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
    protected tableName = 'other_staff_payroll'

    public async up () {
        this.schema.createTable(this.tableName, (table) => {
            table.bigIncrements('id')
            table.integer('other_staff_id').unsigned().references('id').inTable('other_staff').onUpdate('CASCADE').onDelete('CASCADE');            
            table.json('payroll_details').notNullable()
            table.string('payroll_month').notNullable()
            table.string('payroll_year').notNullable()
            table.string('batch').notNullable()
        })
    }

    public async down () {
        this.schema.dropTable(this.tableName)
    }
}
