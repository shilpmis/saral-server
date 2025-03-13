//import { DateTime } from 'luxon'
//import { column } from '@ioc:Adonis/Lucid/Orm'
import Base from '#models/base'
import { column } from '@adonisjs/lucid/orm'

export default class Staff extends Base {
  @column()
  declare employee_code: string

  @column()
  declare school_id: number

  @column()
  declare is_active: boolean

  @column()
  declare is_teaching_role: boolean

  @column()
  declare staff_role_id: number

  @column()
  declare first_name: string

  @column()
  declare middle_name: string

  @column()
  declare last_name: string

  @column()
  declare first_name_in_guj: string

  @column()
  declare middle_name_in_guj: string

  @column()
  declare last_name_in_guj: string

  @column()
  declare gender: 'Male' | 'Female'

  @column()
  declare marital_status: 'Single' | 'Married' | 'Divorced' | 'Widowed'

  @column({
    serialize: (value: Date) => Base.serializeDateAsSQLDateString(value),
  })
  declare birth_date: Date

  @column()
  declare mobile_number: number

  @column()
  declare email: string

  @column()
  declare emergency_contact_name: string

  @column()
  declare emergency_contact_number: number

  // Qualification & Employment
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

  @column()
  declare subject_specialization?:
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

  @column({
    serialize: (value: Date) => Base.serializeDateAsSQLDateString(value),
  })
  declare joining_date: Date

  @column()
  declare employment_status:
    | 'Permanent'
    | 'Trial_period'
    | 'Resigned'
    | 'Contact_base'
    | 'Notice_Period'
  @column()
  declare experience_years: number

  // Identification
  @column()
  declare aadhar_no: number

  @column()
  declare pan_card_no: string

  @column()
  declare epf_no?: number

  @column()
  declare epf_uan_no?: number

  @column()
  declare blood_group: 'A+' | 'A-' | 'B+' | 'B-' | 'O+' | 'O-' | 'AB+' | 'AB-'

  @column()
  declare religion: string

  @column()
  declare religion_in_guj: string

  @column()
  declare caste: string

  @column()
  declare caste_in_guj: string

  @column()
  declare category: 'ST' | 'SC' | 'OBC' | 'OPEN'

  @column()
  declare nationality: string

  // Address Details
  @column()
  declare address: string

  @column()
  declare district: string

  @column()
  declare city: string

  @column()
  declare state: string

  @column()
  declare postal_code: number

  // Bank Details
  @column()
  declare bank_name: string

  @column()
  declare account_no: number

  @column()
  declare IFSC_code: string

  // Profile Photo
  @column()
  declare profile_photo?: string
}