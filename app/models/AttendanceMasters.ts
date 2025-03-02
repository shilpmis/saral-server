//import { DateTime } from 'luxon'
//import { column } from '@ioc:Adonis/Lucid/Orm'
import Base from '#models/base'
import { belongsTo, column, hasMany } from '@adonisjs/lucid/orm'
import { DateTime } from 'luxon'
import AattendanceDetail from './AattendanceDetail.js'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import Schools from './Schools.js'
import Classes from './Classes.js'
import Teacher from './Teacher.js'

export default class AttendanceMasters extends Base {

    @column({ isPrimary: true })
    declare id: number

    @column()
    declare school_id: number

    @column()
    declare class_id: number

    @column()
    declare teacher_id: number

    @column({
      serialize: (value: Date) => Base.serializeDateAsSQLDateString(value),
    })
    declare attendance_date : Date

    @column()
    declare is_holiday: boolean

    @column.dateTime({ autoCreate: true })
    declare created_at: DateTime

    @column.dateTime({ autoCreate: true, autoUpdate: true })
    declare updated_at: DateTime

    @hasMany(() => AattendanceDetail, {
        foreignKey: 'attendance_master_id',
        localKey: 'id'
    })
    declare attendance_details: HasMany<typeof AattendanceDetail>

    @belongsTo(() => Schools)
    declare school: BelongsTo<typeof Schools>

    @belongsTo(() => Classes)
    declare class: BelongsTo<typeof Classes>

    @belongsTo(() => Teacher)
    declare teacher: BelongsTo<typeof Teacher>

}