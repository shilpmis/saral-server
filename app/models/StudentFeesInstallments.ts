//import { DateTime } from 'luxon'
//import { column } from '@ioc:Adonis/Lucid/Orm'
import Base from '#models/base'
import { column, hasMany } from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import ConcessionsInstallmentMasters from './ConcessionsInstallmentMasters.js'

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
  declare discounted_amount: number

  @column()
  declare amount_paid_as_carry_forward: number | null

  @column()
  declare paid_as_refund: boolean

  @column()
  declare refunded_amount: number

  @column()
  declare payment_mode: 'Cash' | 'Online' | 'Bank Transfer'

  @column()
  declare transaction_reference: string | null

  @column()
  declare payment_date: Date

  @column()
  declare remarks: string | null

  @column()
  declare status: 'Pending' | 'Partially Paid' | 'Paid' | 'Overdue' | 'Failed'

  @hasMany(() => ConcessionsInstallmentMasters, {
    foreignKey: 'student_fees_installment_id',
    localKey: 'id',
  })
  declare applied_concessions: HasMany<typeof ConcessionsInstallmentMasters>
}
