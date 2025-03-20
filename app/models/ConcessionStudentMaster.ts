//import { DateTime } from 'luxon'
//import { column } from '@ioc:Adonis/Lucid/Orm'
import Base from '#models/base'
import { belongsTo, column, hasOne } from '@adonisjs/lucid/orm'
import Concessions from './Concessions.js'
import type { BelongsTo, HasOne } from '@adonisjs/lucid/types/relations'

export default class ConcessionStudentMaster extends Base {

    public static table = 'concessions_student_masters'

    @column()
    declare academic_sessions_id : number

    @column()
    declare concession_id : number

    @column()
    declare student_id : number

    @column()
    declare fees_plan_id : number

    @column()
    declare fees_type_id : number | null

    @column()
    declare deduction_type : 'percentage' | 'fixed_amount'

    @column()
    declare amount : number | null

    @column()
    declare percentage : number | null

    @column()
    declare status : 'Active'|'Inactive'

    @belongsTo(()=> Concessions , {
        foreignKey : 'id',
        localKey : 'concession_id',
    })
    declare provconcession : BelongsTo<typeof Concessions>
}