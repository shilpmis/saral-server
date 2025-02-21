import { column } from '@adonisjs/lucid/orm'
import Base from './base.js'

export default class LeaveTypeMaster extends Base {
  
  @column()
  declare school_id : number
  
  @column()
  declare leave_type_name : number
  
  @column()
  declare is_paid : boolean
  
  @column()
  declare affects_payroll : boolean
  
  @column()
  declare requires_proof : boolean
  
  @column()
  declare is_active : boolean

}