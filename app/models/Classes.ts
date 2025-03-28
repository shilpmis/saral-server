import Base from '#models/base'
import { column, hasMany, hasOne } from '@adonisjs/lucid/orm'
import FeesPlan from './FeesPlan.js'
import type { HasOne } from '@adonisjs/lucid/types/relations'
import ClassSeatAvailability from './ClassSeatAvailability.js'
import * as relations from '@adonisjs/lucid/types/relations'
import Divisions from './Divisions.js'

export default class Classes extends Base {
  @column()
  declare school_id: number

  @column()
  declare academic_session_id: number

  @column()
  declare class:
    | 'Nursery'
    | 'LKG'
    | 'UKG'
    | '1'
    | '2'
    | '3'
    | '4'
    | '5'
    | '6'
    | '7'
    | '8'
    | '9'
    | '10'
    | '11'
    | '12'

  @column()
  declare is_active: boolean

  @hasMany(() => Divisions, {
    foreignKey: 'class_id',
    localKey: 'id',
  })
  declare divisions: relations.HasMany<typeof Divisions>

  @hasOne(() => FeesPlan, {
    foreignKey: 'class_id',
    localKey: 'id',
  })
  declare fees_plan: HasOne<typeof FeesPlan>

  @hasMany(() => ClassSeatAvailability, { foreignKey: 'class_id' })
  declare seat_availability: relations.HasMany<typeof ClassSeatAvailability>
}
