//import { DateTime } from 'luxon'
//import { column } from '@ioc:Adonis/Lucid/Orm'
import Base from '#models/base'
import { column, hasMany } from '@adonisjs/lucid/orm'
import StudentFeesInstallments from './StudentFeesInstallments.js'
import type { HasMany } from '@adonisjs/lucid/types/relations'

export default class StudentFeesMaster extends Base {

    public static table = 'student_fees_master'

    @column()
    declare student_id: number

    @column()
    declare academic_session_id: number

    @column()
    declare fees_plan_id: number

    @column()
    declare total_amount: number

    @column()
    declare discounted_amount: number

    @column()
    declare paid_amount: number

    @column()
    declare due_amount: number

    @column()
    declare total_refund_amount: number

    @column()
    declare refunded_amount: number


    @column()
    declare status: 'Pending' | 'Partially Paid' | 'Paid' | 'Overdue'

      @hasMany(() => StudentFeesInstallments, {
        foreignKey: 'student_fees_master_id',
        localKey: 'id',
      })
      declare paid_fees: HasMany<typeof StudentFeesInstallments>
    
}