//import { DateTime } from 'luxon'
//import { column } from '@ioc:Adonis/Lucid/Orm'
import Base from '#models/base'
import { column } from '@adonisjs/lucid/orm'

export default class StaffTemplateComponents extends Base {
  @column()
  declare staff_salary_templates_id: number

  @column()
  declare salary_components_id: number

  @column()
  declare amount: number | null

  @column()
  declare percentage: number | null

  @column()
  declare recovering_end_month: string | null

  @column()
  declare total_recovering_amount: number | null

  @column()
  declare total_recovered_amount: number | null

  @column()
  declare is_mandatory: boolean
}
