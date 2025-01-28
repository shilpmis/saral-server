import { BaseSchema } from '@adonisjs/lucid/schema'

export default class School extends BaseSchema {
    protected tableName = 'school'

    public async up () {
        this.schema.createTable(this.tableName, (table) => {
            table.bigIncrements('id')
            table.string('name').notNullable()
            table.string('email').unique().notNullable()
            table.string('password').notNullable()
            table.string('short_key').notNullable()
            table.enu('subscription_type',['']).notNullable()
            table.date('subscription_start_date').notNullable()
            table.bigInteger('subscription_end_date').notNullable()
            table.bigInteger('contact_number').unique().notNullable()
        })
    }

    public async down () {
        this.schema.dropTable(this.tableName)
    }
}
