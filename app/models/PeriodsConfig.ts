//import { DateTime } from 'luxon'
//import { column } from '@ioc:Adonis/Lucid/Orm'
import Base from '#models/base'
import { column, belongsTo} from '@adonisjs/lucid/orm'
import  LabConfig from './LabConfig.js'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'

export default class PeriodsConfig extends Base {

    static table = 'periods_config'

    @column()
    declare class_day_config_id: number

    @column()
    declare division_id: number

    @column()
    declare period_order: number

    @column()
    declare start_time: string

    @column()
    declare end_time: string

    @column()
    declare is_break : boolean

    @column()
    declare subjects_division_masters_id: number | null

    @column()
    declare staff_enrollment_id : number | null
    
    @column()
    declare lab_id : number | null

    @column()
    declare is_pt : boolean

    @column()
    declare is_free_period : boolean

    @belongsTo(() => LabConfig, {
        localKey: 'id',
        foreignKey: 'lab_id',
    })
    declare lab: BelongsTo<typeof LabConfig>

}