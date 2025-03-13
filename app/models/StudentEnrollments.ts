
import Base from '#models/base'
import { belongsTo, column } from '@adonisjs/lucid/orm'
import Students from './Students.js'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'

export default class StudentEnrollments extends Base {

    public static table = "student_enrollments"

    @column()
    declare student_id: number

    @column()
    declare class_id: number

    @column()
    declare academic_id: number

    @column()
    declare status: 'Permoted' | 'Failed' | 'Pursuing'

    @column()
    declare remarks: string

    @belongsTo(() => Students, {
        foreignKey: 'student_id',
        localKey: 'id'
    })
    declare student: BelongsTo<typeof Students>;

}