//import { DateTime } from 'luxon'
//import { column } from '@ioc:Adonis/Lucid/Orm'
import Base from '#models/base'
import { column } from '@adonisjs/lucid/orm'

export default class ConcessionsInstallmentMasters extends Base {
  public static table = 'concessions_installment_masters'

  @column()
  declare student_fees_installment_id: number

  @column()
  declare concession_id: number

  @column()
  declare concession_amount: number

  @column()
  declare applied_amount: number

  @column()
  declare status: 'Active' | 'Inactive'
}
