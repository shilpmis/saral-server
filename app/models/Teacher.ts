import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class Teacher extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare staff_role_id : number

  @column()
  declare school_id : number

  @column()
  declare first_name : string

  @column()
  declare last_name : string

  @column()
  declare gender : 'Male' | 'Female'

  @column()
  declare birth_date : Date

  @column()
  declare joining_date : Date

  @column()
  declare mobile_number : number

  @column()
  declare email : string

  @column()
  declare qualification : string

  @column()
  declare subject_specialization : string

  @column()
  declare class_id : number

  @column()
  declare employment_status : 'Permanent'| 'Trial_period'| 'Resigned'| 'Contact_base'| 'Notice_Period'

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}