import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class OtherStaff extends BaseModel {
  
  public static table = 'other_staff'

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
  declare mobile_number : string

  @column()
  declare email : string

  @column()
  declare employment_status : string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}