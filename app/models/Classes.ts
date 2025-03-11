//import { DateTime } from 'luxon'
//import { column } from '@ioc:Adonis/Lucid/Orm'
import Base from '#models/base'
import { column } from '@adonisjs/lucid/orm'

export default class Classes extends Base {

    @column()
    declare school_id : number

    @column()
    declare class : 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12

    @column()
    declare division : "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H" | "I" | "J";

    @column()
    declare aliases : string 

    @column()
    declare is_assigned : boolean 

    @column()
    declare academic_session_id: number
}