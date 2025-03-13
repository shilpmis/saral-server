//import { DateTime } from 'luxon'
//import { column } from '@ioc:Adonis/Lucid/Orm'
import Base from '#models/base'
import { column } from '@adonisjs/lucid/orm'

export default class StudentFeesInstallments extends Base {

    @column()
    declare student_fees_master_id: number

    @column()
    declare installment_id: number

    @column()
    declare paid_amount: number

    @column()
    declare remaining_amount: number

    @column()
    declare payment_mode: 'Cash' | 'Online'| 'Bank Transfer'

    @column()
    declare transaction_reference: string | null

    @column()
    declare payment_date: Date

    @column()
    declare remarks: string | null

    @column()
    declare status: 'Pending' | 'Partially Paid' | 'Paid' | 'Overdue' | 'Failed'


}