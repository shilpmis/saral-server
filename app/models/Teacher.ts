import { column, hasOne, SnakeCaseNamingStrategy } from '@adonisjs/lucid/orm'
import Base from './base.js'
import StaffMaster from './StaffMaster.js'
import type { HasOne } from '@adonisjs/lucid/types/relations'
import Schools from './Schools.js'

export default class Teacher extends Base {

  public static namingStrategy = new SnakeCaseNamingStrategy()

  @column()
  declare staff_role_id: number

  @column()
  declare school_id: number

  @column()
  declare first_name: string

  @column()
  declare middle_name: string | null

  @column()
  declare last_name: string

  @column()
  declare first_name_in_guj: string | null

  @column()
  declare middle_name_in_guj: string | null

  @column()
  declare last_name_in_guj: string | null

  @column()
  declare aadhar_no: number

  @column()
  declare religiion: string | null

  @column()
  declare religiion_in_guj: string | null

  @column()
  declare caste: string | null

  @column()
  declare caste_in_guj: string | null

  @column()
  declare category: 'ST' | 'SC' | 'OBC' | 'OPEN'

  @column()
  declare address: string | null

  @column()
  declare district: string | null

  @column()
  declare city: string | null

  @column()
  declare state: string | null

  @column()
  declare postal_code: number | null

  @column()
  declare bank_name: string | null

  @column()
  declare account_no: number | null

  @column()
  declare IFSC_code: string | null

  @column()
  declare gender: 'Male' | 'Female'

  @column({
    serialize: (value: Date) => Base.serializeDateAsSQLDateString(value),
  })
  declare birth_date: Date | null

  @column({
    serialize: (value: Date) => Base.serializeDateAsSQLDateString(value),
  })
  declare joining_date: Date | null

  @column()
  declare mobile_number: number

  @column()
  declare email: string | null

  @column()
  declare qualification: string | null

  @column()
  declare subject_specialization: string | null

  @column()
  declare class_id: number | null

  @column()
  declare employment_status: 'Permanent' | 'Trial_period' | 'Resigned' | 'Contact_base' | 'Notice_Period'

  @hasOne(() => StaffMaster, {
    localKey: 'staff_role_id',
    foreignKey: 'id',
    serializeAs: 'role_meta',
  })
  declare role_type: HasOne<typeof StaffMaster>

  @hasOne(() => Schools, {
    localKey: 'school_id',
    foreignKey: 'id',
  })
  declare school: HasOne<typeof Schools>
}