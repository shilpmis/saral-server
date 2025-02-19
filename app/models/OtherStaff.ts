import { column, hasOne, SnakeCaseNamingStrategy } from '@adonisjs/lucid/orm'
import Base from './base.js'
import StaffMaster from './StaffMaster.js'
import type { HasOne } from '@adonisjs/lucid/types/relations'

export default class OtherStaff extends Base {

  public static namingStrategy = new SnakeCaseNamingStrategy()
  
  public static table = 'other_staff'

  @column()
  declare staff_role_id : number

  @column()
  declare school_id : number

  @column()
  declare first_name : string

  @column()
  declare middle_name : string

  @column()
  declare last_name : string

  @column()
  declare first_name_in_guj : string

  @column()
  declare middle_name_in_guj : string

  @column()
  declare last_name_in_guj : string

  @column()
  declare aadhar_no : number

  @column()
  declare religiion : string

  @column()
  declare religiion_in_guj : string

  @column()
  declare caste : string

  @column()
  declare caste_in_guj : string
  
  @column()
  declare category : 'ST' | 'SC' | 'OBC' | 'OPEN'

  @column()
  declare address : string

  @column()
  declare district : string

  @column()
  declare city : string

  @column()
  declare state : string

  @column()
  declare postal_code : number

  @column()
  declare bank_name : string

  @column()
  declare account_no : number

  @column()
  declare IFSC_code : string

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
  declare employment_status : string

    @hasOne(() =>  StaffMaster, {
      localKey : 'staff_role_id',
      foreignKey : 'id',
      serializeAs : 'role_meta',
    })
    declare role_type : HasOne<typeof StaffMaster>

}