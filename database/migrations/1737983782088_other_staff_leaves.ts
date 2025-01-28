import { BaseSchema } from '@adonisjs/lucid/schema'

export default class OtherStaffLeaves extends BaseSchema {
    protected tableName = 'other_staff_leaves'

    public async up () {
        this.schema.createTable(this.tableName, (table) => {
            table.bigIncrements('id')
            table.bigInteger('leave_policy_id').notNullable()
            table.bigInteger('other_staff_id').notNullable()
            table.bigInteger('is_half_day').notNullable()
            table.date('start_date').notNullable()
            table.date('end_date').notNullable()
            table.boolean('approved_by').notNullable()
            table.string('month_of_leave').notNullable()
            table.string('year_of_leave').notNullable()
            table.string('batch').notNullable()
        })
    }

    public async down () {
        this.schema.dropTable(this.tableName)
    }
}
