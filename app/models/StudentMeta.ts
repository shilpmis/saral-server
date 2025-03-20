//import { DateTime } from 'luxon'
//import { column } from '@ioc:Adonis/Lucid/Orm'
import Base from '#models/base'
import { column } from '@adonisjs/lucid/orm'

export default class StudentMeta extends Base {

    public static table = "students_meta"

    @column()
    declare student_id : number 

    @column()
    declare aadhar_dise_no :number | null

    @column()
    declare birth_place :string | null

    @column()
    declare birth_place_in_guj :string | null 

    @column()
    declare religion :string | null

    @column()
    declare religion_in_guj :string | null 

    @column()
    declare caste :string | null

    @column()
    declare caste_in_guj :string | null 

    @column()
    declare category :'ST' | 'SC' | 'OBC' | 'OPEN' | null

    @column()
    declare blood_group : 'A+'| 'A-'| 'B+'| 'B-'| 'O+'| 'O-'| 'AB+'| 'AB-' | null

    @column()
    declare identification_mark : string | null

    @column()
    declare residence_type : 'day_scholar'| 'residential' | 'semi_residential' | null

    @column({
        serialize: (value: Date) => Base.serializeDateAsSQLDateString(value),
      })
    declare admission_date :Date | null


    @column()
    declare admission_class_id :number | null

    @column()
    declare secondary_mobile :number | null

    @column()
    declare privious_school :string | null

    @column()
    declare privious_school_in_guj :string | null  

    @column()
    declare address :string  | null

    @column()
    declare district :string | null

    @column()
    declare city :string  | null

    @column()
    declare state :string  | null

    @column()
    declare postal_code :string  | null

    @column()
    declare bank_name :string  | null

    @column()
    declare account_no :number  | null

    @column()
    declare IFSC_code :string  | null
  
}