//import { DateTime } from 'luxon'
//import { column } from '@ioc:Adonis/Lucid/Orm'
import Base from '#models/base'
import { column } from '@adonisjs/lucid/orm'

export default class Students extends Base {
    
    @column()
    declare school_id : number

    @column()
    declare class_id : string

    @column()
    declare first_name : string

    @column()
    declare last_name : string

    @column()
    declare gender : 'Male' | 'Female' 

    @column()
    declare gr_no : number

    @column()
    declare birth_date : Date

    @column()
    declare mobile_number : number

    @column()
    declare father_name : string

    @column()
    declare mother_name : string

    @column()
    declare roll_number : number

}