//import { DateTime } from 'luxon'
//import { column } from '@ioc:Adonis/Lucid/Orm'
import Base from '#models/base'
import { column, hasMany } from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import StudentFeesTypeInstallmentBreakdowns from './StudentFeesTypeInstallmentBreakdowns.js'
import StudentExtraFeesInstallments from './StudentExtraFeesInstallments.js'

export default class StudentFeesTypeMasters extends Base {

    @column()
    declare student_enrollments_id: number

    @column()
    declare fees_plan_id: number

    @column()
    declare fees_type_id: number

    @column()
    declare total_amount: number

    @column()
    declare paid_amount: number

    @column()
    declare status: 'Active' | 'Inactive'

    @hasMany(() => StudentFeesTypeInstallmentBreakdowns, {
        foreignKey: 'student_fees_type_masters_id',
        localKey: 'id',
    })
    declare installment_breakdown: HasMany<typeof StudentFeesTypeInstallmentBreakdowns>

      @hasMany(() => StudentExtraFeesInstallments, {
        foreignKey: 'student_fees_type_masters_id',
        localKey: 'id',
    })
    declare paid_installment: HasMany<typeof StudentExtraFeesInstallments>
}