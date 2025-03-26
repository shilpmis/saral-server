//import { DateTime } from 'luxon'
//import { column } from '@ioc:Adonis/Lucid/Orm'
import Base from '#models/base'
import { column, hasOne } from '@adonisjs/lucid/orm'
import type { HasOne } from '@adonisjs/lucid/types/relations'
import StaffMaster from './StaffMaster.js'
import LeaveTypeMaster from './LeaveTypeMaster.js'

export default class LeavePolicies extends Base {
  @column()
  declare school_id: number

  @column()
  declare academic_session_id: number

  @column()
  declare staff_role_id: number

  @column()
  declare leave_type_id: number

  @column()
  declare annual_quota: number

  @column()
  declare can_carry_forward: boolean

  @column()
  declare max_carry_forward_days: number

  @column()
  declare max_consecutive_days: number

  @column()
  declare requires_approval: boolean

  @column()
  declare deduction_rules: Object

  @column()
  declare approval_hierarchy: Object

  // @column()
  // declare is_active : boolean

  @hasOne(() => StaffMaster, {
    localKey: 'staff_role_id',
    foreignKey: 'id',
  })
  declare staff_role: HasOne<typeof StaffMaster>

  @hasOne(() => LeaveTypeMaster, {
    localKey: 'leave_type_id',
    foreignKey: 'id',
  })
  declare leave_type: HasOne<typeof LeaveTypeMaster>
}
