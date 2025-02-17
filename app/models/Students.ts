//import { DateTime } from 'luxon'
//import { column } from '@ioc:Adonis/Lucid/Orm'
import Base from '#models/base'
import { column, hasOne, SnakeCaseNamingStrategy } from '@adonisjs/lucid/orm'
import StudentMeta from './StudentMeta.js'
import type { HasOne } from '@adonisjs/lucid/types/relations'

export default class Students extends Base {

  public static namingStrategy = new SnakeCaseNamingStrategy()

    @column()
    declare school_id : number

    @column()
    declare class_id : string

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
    declare gender : 'Male' | 'Female' 

    @column()
    declare birth_date : Date

    @column()
    declare gr_no : number

    @column()
    declare primary_mobile : number

    @column()
    declare father_name : string

    @column()
    declare father_name_in_guj : string

    @column()
    declare mother_name : string

    @column()
    declare mother_name_in_guj : string

    @column()
    declare roll_number : number

    @column()
    declare aadhar_no : number

    @column()
    declare is_active : boolean

    @hasOne(()=> StudentMeta , {
        foreignKey : 'student_id',
        localKey : 'id'
    })
    declare student_meta : HasOne<typeof StudentMeta>

}