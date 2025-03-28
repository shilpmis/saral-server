import {  belongsTo, column } from '@adonisjs/lucid/orm'
import Staff from './Staff.js'
import * as relations from '@adonisjs/lucid/types/relations'
import Base from './base.js'

export default class StaffEnrollment extends Base {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare academic_session_id: number

  @column()
  declare staff_id: number

  @column()
  declare school_id : number

  @column()
  declare status: 'Retained' | 'Transfer' | 'Resigned' | 'New-Joiner'

  @column()
  declare remarks: string | null

  @belongsTo(() => Staff, {
    foreignKey: 'staffId',
    localKey: 'id'
  })
  declare staff: relations.BelongsTo<typeof Staff>
}