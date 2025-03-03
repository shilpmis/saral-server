//import { DateTime } from 'luxon'
//import { column } from '@ioc:Adonis/Lucid/Orm'
import Base from '#models/base'
import { column } from '@adonisjs/lucid/orm'

export default class Inquiries extends Base {

    public static table = 'admission_inquiries'

    @column()
    declare school_id: number

    @column()
    declare student_name: string

    @column()
    declare parent_name: string

    @column()
    declare contact_number: number

    @column()
    declare email: string | null

    @column()
    declare grade_applying: number

    @column()
    declare created_by: number

    @column()
    declare status: 'pendding' | 'rejected' | 'approved'
}