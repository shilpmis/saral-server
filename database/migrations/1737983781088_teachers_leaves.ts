import { BaseSchema } from '@adonisjs/lucid/schema'

export default class TeachersLeaves extends BaseSchema {
    protected tableName = 'teachers_leaves'

    public async up () {
        this.schema.createTable(this.tableName, (table) => {
            table.bigIncrements('id')
            table.bigInteger('leave_polices_id').notNullable()
            table.bigInteger('teacher_id').notNullable()
            table.boolean('is_half_day').notNullable().defaultTo(false)
            table.date('start_date').notNullable()
            table.bigInteger('end_date').notNullable()
            table.bigInteger('approved_by').notNullable()
            table.string('month_of_leave').notNullable()
            table.bigInteger('year_of_leave').notNullable()
            table.string('batch').notNullable()
        })
    }

    public async down () {
        this.schema.dropTable(this.tableName)
    }
}
