import Base from '#models/base'
import { column, hasOne } from '@adonisjs/lucid/orm'
import { DateTime } from 'luxon'
import Schools from '#models/Schools'
import * as relations from '@adonisjs/lucid/types/relations'

export default class AcademicSession extends Base {
  static table = 'academic_sessions'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare uuid: string

  @column()
  declare school_id: number

  @column()
  declare session_name: string

  @column.date()
  declare start_date: DateTime

  @column.date()
  declare end_date: DateTime

  @column()
  declare start_month: string

  @column()
  declare end_month: string

  @column()
  declare start_year: string

  @column()
  declare end_year: string

  @column()
  declare is_active: string

  @column.dateTime({ autoCreate: true })
  declare created_at: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updated_at: DateTime

  @hasOne(() => Schools, {
      localKey: 'school_id',
      foreignKey: 'id',
  })
  declare school: relations.HasOne<typeof Schools>
}