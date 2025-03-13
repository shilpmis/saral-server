import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import Staff from './Staff.js'
import * as relations from '@adonisjs/lucid/types/relations'

export default class StaffEnrollment extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare academicId: number

  @column()
  declare staffId: number

  @column()
  declare status: 'Retained' | 'Transfer' | 'Resigned'

  @column()
  declare remarks: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Staff, {
    foreignKey: 'staffId',
    localKey: 'id'
  })
  declare staff: relations.BelongsTo<typeof Staff>
}