//import { DateTime } from 'luxon'
//import { column } from '@ioc:Adonis/Lucid/Orm'
import Base from '#models/base'
import { column } from '@adonisjs/lucid/orm'

export default class SchoolTimeTableConfig extends Base {

    @column()
    declare academic_session_id : number

    @column()
    declare max_periods_per_day : number

    @column()
    declare default_period_duration : number

    @column()
    declare allowed_period_durations : number[]

    @column()
    declare lab_enabled : boolean

    @column()
    declare pt_enabled : boolean

    @column()
    declare period_gap_duration : number | null

    @column()
    declare teacher_max_periods_per_day : number | null

    @column()
    declare teacher_max_periods_per_week : number | null

    @column()
    declare is_lab_included_in_max_periods : boolean

}