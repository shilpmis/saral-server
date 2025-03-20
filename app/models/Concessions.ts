//import { DateTime } from 'luxon'
//import { column } from '@ioc:Adonis/Lucid/Orm'
import Base from '#models/base'
import { column } from '@adonisjs/lucid/orm'

export default class Concessions extends Base {

    @column()
    declare school_id : number

    @column()
    declare academic_session_id : number

    @column()
    declare name : string

    @column()
    declare description : string

    @column()
    declare applicable_to : 'fees_types' | 'plan' |'students'

    @column()
    declare category : 'Family'| 'Sports' | 'Staff' | 'Education' | 'Financial' | 'Other'

}