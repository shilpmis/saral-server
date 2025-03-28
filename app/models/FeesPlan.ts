import { column, hasMany } from '@adonisjs/lucid/orm'
import Base from './base.js'
import ConcessionFeesPlanMaster from './ConcessionFeesPlanMaster.js'
import type { HasMany } from '@adonisjs/lucid/types/relations'

export default class FeesPlan extends Base {
  public static table = 'fees_plans'

  @column()
  declare academic_session_id: number

  @column()
  declare division_id: number

  @column()
  declare name: string

  @column()
  declare description: string

  @column()
  declare total_amount: number

  @column()
  declare status: 'Active' | 'Inactive'

  @hasMany(() => ConcessionFeesPlanMaster, {
    foreignKey: 'fees_plan_id',
    localKey: 'id',
  })
  declare concession_for_plan: HasMany<typeof ConcessionFeesPlanMaster>
}
