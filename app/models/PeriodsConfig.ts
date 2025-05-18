//import { DateTime } from 'luxon'
//import { column } from '@ioc:Adonis/Lucid/Orm'
import Base from '#models/base'
import { column } from '@adonisjs/lucid/orm'

export default class PeriodsConfig extends Base {

    @column()
    declare class_day_config: number

    @column()
    declare period_order: number

    @column()
    declare start_time: number

    @column()
    declare end_time: number

    @column()
    declare is_break : boolean

    @column()
    declare subjects_division_masters_id: number

    @column()
    declare staff_enrollment_id : number
    
    @column()
    declare lab_id : number | null

    @column()
    declare is_pt : boolean

    @column()
    declare is_free_period : boolean


}