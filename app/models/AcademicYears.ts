//import { DateTime } from 'luxon'
//import { column } from '@ioc:Adonis/Lucid/Orm'
import Base from '#models/base'
import { column } from '@adonisjs/lucid/orm'

export default class AcademicYears extends Base {

    @column()
    declare school_id : number

    @column()
    declare name : string

    @column()
    declare start_date : Date

    @column()
    declare end_date : Date   

    @column()
    declare start_month : string   

    @column()
    declare end_month : string   

    @column()
    declare start_year : string   

    @column()
    declare end_year : string   

    @column()
    declare status : 'Active'| 'Inactive'   
}