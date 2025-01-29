import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
    protected tableName = 'other_staff_leaves'

    public async up () {
        this.schema.createTable(this.tableName, (table) => {
            table.bigIncrements('id')
            table.integer('other_staff_id').unsigned().references('id').inTable('other_staff').onUpdate('CASCADE').onDelete('CASCADE');            
            table.string('leave_type' , 50).notNullable();
            table.boolean('is_half_day').notNullable().defaultTo(false)
            table.date('start_date').notNullable()
            table.bigInteger('end_date').notNullable()
            table.string('month_of_leave').notNullable()
            table.bigInteger('year_of_leave').notNullable()
            table.bigInteger('approved_by').notNullable()
            table.integer('user_id').unsigned().references('id').inTable('users').onUpdate('CASCADE').onDelete('CASCADE');            
            table.string('batch').notNullable()
        })
    }

    public async down () {
        this.schema.dropTable(this.tableName)
    }
}
