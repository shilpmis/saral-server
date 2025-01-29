import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
    protected tableName = 'classes'

    public async up () {
        this.schema.createTable(this.tableName, (table) => {
            table.increments('id')
            table.integer('school_id').unsigned().references('id').inTable('school').onUpdate('CASCADE').onDelete('CASCADE');
            table.enum('class' , [1 , 2 , 3 , 4 ,5 , 6, 7 , 8 , 9 , 10 , 11 ,12]).notNullable();
            table.enum('division' , ['A' , 'B' , 'C' , 'D' , 'E' , 'F' , 'G' , 'H']).notNullable().defaultTo('A')
            table.string('aliases').nullable();

            table.timestamp('created_at');
            table.timestamp('updated_at');

            table.unique(['school_id', 'class', 'division']);
            
        })
    }

    public async down () {
        this.schema.dropTable(this.tableName)
    }
}
