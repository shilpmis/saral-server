import Base from '#models/base'
import { column, hasMany } from '@adonisjs/lucid/orm'
import PeriodsConfig from './PeriodsConfig.js'
import type { HasMany } from '@adonisjs/lucid/types/relations'

export default class ClassDayConfig extends Base {

    static table = 'class_day_config'

    @column()
    declare school_timetable_config_id: number

    @column()
    declare class_id: number

    @column()
    declare day: 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat'  // e.g. "Monday", "Tuesday", etc.

    @column({
        prepare: (value: string[]) => value && JSON.parse(JSON.stringify(value)),
        // consume: (value: string) => value && JSON.parse(value)
    })
    declare allowed_durations: string | null // e.g. [30, 45]

    @column()
    declare max_consecutive_periods: number | null  // optional, e.g. 3

    @column()
    declare total_breaks: number // optional, e.g. "08:00"

    @column({
        prepare: (value: string[]) => value && JSON.parse(JSON.stringify(value)),
        // consume: (value: string) => value && JSON.parse(value)
    })
    declare break_durations: string | null // e.g. [15, 45]

    @column()
    declare day_start_time: string | null // optional

    @column()
    declare day_end_time: string | null // optional

    @hasMany(() => PeriodsConfig, {
        foreignKey: 'class_day_config_id',
        localKey: 'id',
    })
    declare period_config: HasMany<typeof PeriodsConfig>

}