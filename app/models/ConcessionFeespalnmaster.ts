//import { DateTime } from 'luxon'
//import { column } from '@ioc:Adonis/Lucid/Orm'
import Base from '#models/base'
import { column } from '@adonisjs/lucid/orm'

export default class ConcessionFeespalnmaster extends Base {

    @column()
    declare academic_year_id : number

    @column()
    declare concession_id : number

    @column()
    declare fees_plan_id : number

    @column()
    declare fees_type_id : number

    @column()
    declare concession_type : 'Percentage' | 'Fixed_Amount'

    @column()
    declare amount : number | null

    @column()
    declare percentage : number | null

    @column()
    declare status : 'Active'| 'Inactive'

}