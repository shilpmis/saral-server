//import { DateTime } from 'luxon'
//import { column } from '@ioc:Adonis/Lucid/Orm'
import Base from '#models/base'
import { column, hasMany, hasOne } from '@adonisjs/lucid/orm'
import StudentMeta from './StudentMeta.js'
import type { HasMany, HasOne } from '@adonisjs/lucid/types/relations'
import StudentFeesMaster from './StudentFeesMaster.js'
import ConcessionStudentMaster from './ConcessionStudentMaster.js'

export default class Students extends Base {

    @column()
    declare school_id : number

    // @column()
    // declare class_id : number   // link table will be used to fetch the student's class

    @column()
    declare enrollment_code : string

    @column()
    declare admission_number : string | null

    @column()
    declare first_name : string

    @column()
    declare middle_name : string | null

    @column()
    declare last_name : string

    @column()
    declare first_name_in_guj : string | null

    @column()
    declare middle_name_in_guj : string | null

    @column()
    declare last_name_in_guj : string | null

    @column()
    declare gender : 'Male' | 'Female' 

    @column({
      serialize: (value: Date) => Base.serializeDateAsSQLDateString(value),
    })
    declare birth_date : Date | null

    @column()
    declare gr_no : number 

    @column()
    declare primary_mobile : number

    @column()
    declare father_name : string | null 

    @column()
    declare father_name_in_guj : string | null

    @column()
    declare mother_name : string | null

    @column()
    declare mother_name_in_guj : string | null

    @column()
    declare roll_number : number | null

    @column()
    declare aadhar_no : number | null

    @column()
    declare is_active : boolean

    @hasOne(()=> StudentMeta , {
        foreignKey : 'student_id',
        localKey : 'id',       
    })
    declare student_meta : HasOne<typeof StudentMeta>

    @hasOne(()=> StudentFeesMaster , {
        foreignKey : 'student_id',
        localKey : 'id',       
    })
    declare fees_status : HasOne<typeof StudentFeesMaster>

    @hasMany(()=> ConcessionStudentMaster , {
        foreignKey : 'student_id',
        localKey : 'id',
    })
    declare provided_concession : HasMany<typeof ConcessionStudentMaster>    
}