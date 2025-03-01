import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import Base from './base.js'
import AttendanceMasters from './AttendanceMasters.js'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Students from './Students.js'

export default class AattendanceDetail extends Base {

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare attendance_master_id: number

  @column()
  declare student_id: number

  @column()
  declare attendance_status: 'present' | 'absent' | 'late' | 'half_day'

  @column()
  declare remarks?: string

  @column.dateTime({ autoCreate: true })
  declare created_at: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updated_at: DateTime

  @belongsTo(() => AttendanceMasters)
  declare attendance_master: BelongsTo<typeof AttendanceMasters>

  @belongsTo(() => Students)
  declare student: BelongsTo<typeof Students>
}