import Base from '#models/base'
import { belongsTo, column } from '@adonisjs/lucid/orm'
import LeaveTypeMaster from './LeaveTypeMaster.js'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Staff from './Staff.js'

export default class StaffLeaveApplication extends Base {
  @column()
  declare uuid: string

  @column()
  declare staff_id: number

  @column()
  declare academic_session_id: number

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
  declare half_day_type: 'first_half' | 'second_half' | 'none'

  @column()
  declare is_hourly_leave: boolean

  @column()
  declare total_hour: number | null

  @column()
  declare documents: Object

  @column()
  declare status: 'pending' | 'approved' | 'rejected' | 'cancelled'

  @belongsTo(() => LeaveTypeMaster, {
    localKey: 'id',
    foreignKey: 'leave_type_id',
  })
  declare leave_type: BelongsTo<typeof LeaveTypeMaster>

  @belongsTo(() => Staff, {
    localKey: 'id',
    foreignKey: 'staff_id',
  })
  declare staff: BelongsTo<typeof Staff>
}
