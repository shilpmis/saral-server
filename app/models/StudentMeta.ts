//import { DateTime } from 'luxon'
//import { column } from '@ioc:Adonis/Lucid/Orm'
import Base from '#models/base'
import { column } from '@adonisjs/lucid/orm'

export default class StudentMeta extends Base {

    @column()
    declare student_id : number 

    @column()
    declare religion :string 

    @column()
    declare birth_place :string 

    @column()
    declare sms_number :string 

    @column()
    declare address :string 

    @column()
    declare city :string 

    @column()
    declare state :string 

    @column()
    declare district :string 

    @column()
    declare postal_code :number 

    @column()
    declare cast :string 

    @column()
    declare cast_description :string 

    @column()
    declare aadhaar_number :number 

    @column()
    declare aadhaar_dias_number :number 

    @column()
    declare any_medical_allergy :boolean  

    @column()
    declare medical_allergy_type :string  

    @column()
    declare father_mobile :number  

    @column()
    declare mother_mobile :number  

    @column()
    declare father_occupation :string  

    @column()
    declare mother_occupation :string  

    @column()
    declare eligibility_for_scholarship :boolean  

    @column()
    declare school_joining_date :Date  

    @column()
    declare past_school :string  
  
}