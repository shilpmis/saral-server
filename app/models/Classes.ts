//import { DateTime } from 'luxon'
import Base from '#models/base'
import { column, hasOne } from '@adonisjs/lucid/orm'
import FeesPlan from './FeesPlan.js';
import type { HasOne } from '@adonisjs/lucid/types/relations';

export default class Classes extends Base {

    @column()
    declare school_id: number

    @column()
    declare class: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12

    @column()
    declare division: "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H" | "I" | "J";

    @column()
    declare aliases: string | null

    @column()
    declare is_assigned : boolean 

    @column()
    declare academic_session_id: number
    
    @hasOne(() => FeesPlan, {
        foreignKey: 'class_id',
        localKey: 'id'
    })
    declare fees_plan: HasOne<typeof FeesPlan>

}