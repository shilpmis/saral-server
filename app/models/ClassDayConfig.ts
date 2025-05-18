//import { DateTime } from 'luxon'
//import { column } from '@ioc:Adonis/Lucid/Orm'
import Base from '#models/base'
import { column } from '@adonisjs/lucid/orm'

export default class ClassDayConfig extends Base {

    @column()
    declare class_id: number

    @column()
    declare day: 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat'  // e.g. "Monday", "Tuesday", etc.

    @column()
    declare allowed_durations: number[] // e.g. [30, 45]

    @column()
    declare max_consecutive_periods: number | null  // optional, e.g. 3

    @column()
    declare total_breaks: number // optional, e.g. "08:00"

    @column()
    declare break_durations: number[] | null // e.g. [15, 45]

    @column()
    declare day_start_time: string | null // optional

    @column()
    declare day_end_time: string | null // optional
}