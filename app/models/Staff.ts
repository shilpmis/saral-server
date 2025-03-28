import Base from '#models/base'
import { belongsTo, column, hasMany, hasOne } from '@adonisjs/lucid/orm'
import Schools from './Schools.js'
import type { BelongsTo, HasMany, HasOne } from '@adonisjs/lucid/types/relations'
import StaffMaster from './StaffMaster.js'
import ClassTeacherMaster from '#models/Classteachermaster'
export default class Staff extends Base {
  @column()
  declare employee_code: string

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
  declare aadhar_no: number | null

  @column()
  declare religion: string | null

  @column()
  declare religion_in_guj: string | null

  @column()
  declare caste: string | null

  @column()
  declare caste_in_guj: string | null

  @column()
  declare category: 'ST' | 'SC' | 'OBC' | 'OPEN' | null

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
  declare nationality: string | null

  @column()
  declare IFSC_code: string | null

  @column()
  declare profile_photo: string | null

  @column()
  declare is_active: boolean

  @column()
  declare is_teching_staff: boolean

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
  declare qualification:
    | 'D.Ed'
    | 'B.Ed'
    | 'M.Ed'
    | 'B.A + B.Ed'
    | 'B.Sc + B.Ed'
    | 'M.A + B.Ed'
    | 'M.Sc + B.Ed'
    | 'Ph.D'
    | 'Diploma'
    | 'B.Com'
    | 'BBA'
    | 'MBA'
    | 'M.Com'
    | 'ITI'
    | 'SSC'
    | 'HSC'
    | 'Others'
    | null

  @column()
  declare subject_specialization:
    | 'Mathematics'
    | 'Physics'
    | 'Chemistry'
    | 'Biology'
    | 'English'
    | 'Hindi'
    | 'Gujarati'
    | 'Social Science'
    | 'Computer Science'
    | 'Commerce'
    | 'Economics'
    | 'Physical Education'
    | 'Arts'
    | 'Music'
    | 'Others'
    | null

  @column()
  declare blood_group: string | null

  @column()
  declare employment_status:
    | 'Permanent'
    | 'Trial_Period'
    | 'Resigned'
    | 'Contract_Based'
    | 'Notice_Period'

  @belongsTo(() => StaffMaster, {
    localKey: 'id',
    foreignKey: 'staff_role_id',
  })
  declare role_type: BelongsTo<typeof StaffMaster>

  @hasOne(() => Schools, {
    localKey: 'school_id',
    foreignKey: 'id',
  })
  declare school: HasOne<typeof Schools>

  @hasMany(() => ClassTeacherMaster, {
    localKey: 'id',
    foreignKey: 'staff_id',
  })
  declare assigend_classes: HasMany<typeof ClassTeacherMaster>
}
