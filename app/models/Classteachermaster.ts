//import { DateTime } from 'luxon'
//import { column } from '@ioc:Adonis/Lucid/Orm'
import Base from '#models/base'
import { column } from '@adonisjs/lucid/orm'

export default class ClassTeacherMaster extends Base {

    @column()
    declare academic_sessions_id: number

    @column()
    declare class_id: number

    @column()
    declare staff_id: number

}