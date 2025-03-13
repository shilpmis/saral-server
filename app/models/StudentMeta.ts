//import { DateTime } from 'luxon'
//import { column } from '@ioc:Adonis/Lucid/Orm'
import Base from '#models/base'
import { column } from '@adonisjs/lucid/orm'

export default class StudentMeta extends Base {

    public static table = "student_metas"

    @column()
    declare student_id : number 

    @column()
    declare aadhar_dise_no :number

    @column()
    declare birth_place :string 

    @column()
    declare birth_place_in_guj :string 

    @column()
    declare religiion :string 

    @column()
    declare religiion_in_guj :string 

    @column()
    declare caste :string 

    @column()
    declare caste_in_guj :string 

    @column()
    declare category :'ST' | 'SC' | 'OBC' | 'OPEN'

    @column()
    declare blood_group : 'A+'| 'A-'| 'B+'| 'B-'| 'O+'| 'O-'| 'AB+'| 'AB-'

    @column()
    declare identification_mark : string

    @column()
    declare residence_type : 'day_scholar'| 'residential' | 'semi_residential'

    @column({
        serialize: (value: Date) => Base.serializeDateAsSQLDateString(value),
      })
    declare admission_date :Date 


    @column()
    declare admission_class_id :number 

    @column()
    declare secondary_mobile :number 

    @column()
    declare privious_school :string 

    @column()
    declare privious_school_in_guj :string  

    @column()
    declare address :string  

    @column()
    declare district :string 

    @column()
    declare city :string  

    @column()
    declare state :string  

    @column()
    declare postal_code :string  

    @column()
    declare bank_name :string  

    @column()
    declare account_no :number  

    @column({serializeAs : 'IFSC_code'})
    declare IFSC_code :string  
  
}