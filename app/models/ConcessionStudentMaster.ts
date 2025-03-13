//import { DateTime } from 'luxon'
//import { column } from '@ioc:Adonis/Lucid/Orm'
import Base from '#models/base'
import { column } from '@adonisjs/lucid/orm'

export default class ConcessionStudentMaster extends Base {

    @column()
    declare academic_year_id : number

    @column()
    declare concessions_id : number

    @column()
    declare student_id : number

    @column()
    declare fees_plan_id : number

    @column()
    declare fees_type_id : number

    @column()
    declare concession_type : 'Percentage' | 'Fixed_Amount'

    @column()
    declare amount : number

    @column()
    declare percentage : number

    @column()
    declare status : 'Active'|'Inactive'
}