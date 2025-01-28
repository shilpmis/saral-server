import { BaseSchema } from '@adonisjs/lucid/schema'

export default class TeachersPayroll extends BaseSchema {
    protected tableName = 'teachers_payroll'

    public async up () {
        this.schema.createTable(this.tableName, (table) => {
            table.bigIncrements('id')
            table.bigInteger('teacher_id').notNullable()
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
