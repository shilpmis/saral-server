//import { DateTime } from 'luxon'
//import { column } from '@ioc:Adonis/Lucid/Orm'
import Base from '#models/base'
import { column, hasOne } from '@adonisjs/lucid/orm'
import OtherStaff from './OtherStaff.js'
import LeaveTypeMaster from './LeaveTypeMaster.js'
import type { HasOne } from '@adonisjs/lucid/types/relations'

export default class OtherStaffLeaveApplication extends Base {

  @column()
  declare uuid: string

  @column()
  declare other_staff_id: number

  @column()
  declare leave_type_id: number

  @column()
  declare applied_by: number | null

  @column()
  declare applied_by_self: boolean

  @column({
    serialize: (value: Date) => Base.serializeDateAsSQLDateString(value),
  })
  declare from_date: Date

  @column({
    serialize: (value: Date) => Base.serializeDateAsSQLDateString(value),
  })
  declare to_date: Date

  @column()
  declare number_of_days: number

  @column()
  declare reason: string

  @column()
  declare is_half_day: boolean

  @column()
  declare half_day_type: 'first_half' | 'second_half' | "none"

  @column()
  declare is_hourly_leave: boolean

  @column()
  declare total_hour: number | null

  @column()
  declare documents: Object

  @column()
declare status: 'pending' | 'approved' | 'rejected' | 'cancelled'

  @hasOne(() => LeaveTypeMaster, {
    localKey: 'leave_type_id',
    foreignKey: 'id',
  })
  declare leave_type: HasOne<typeof LeaveTypeMaster>

  @hasOne(() => OtherStaff, {
    localKey: 'other_staff_id',
    foreignKey: 'id',
  })
  declare staff: HasOne<typeof OtherStaff>

}