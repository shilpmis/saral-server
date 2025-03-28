//import { DateTime } from 'luxon'
//import { column } from '@ioc:Adonis/Lucid/Orm'
import Base from '#models/base'
import { belongsTo, column, hasOne } from '@adonisjs/lucid/orm'
import FeesPlan from './FeesPlan.js'
import type { BelongsTo, HasOne } from '@adonisjs/lucid/types/relations'
import Classes from './Classes.js'

export default class Divisions extends Base {
  @column()
  declare class_id: number

  @column()
  declare academic_session_id: number

  @column()
  declare division: 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H' | 'I' | 'J'

  @column()
  declare aliases: string | null

  @hasOne(() => FeesPlan, {
    foreignKey: 'class_id',
    localKey: 'id',
  })
  declare fees_plan: HasOne<typeof FeesPlan>

  @belongsTo(() => Classes, {
    foreignKey: 'class_id',
    localKey: 'id',
  })
  declare class: BelongsTo<typeof Classes>
}
