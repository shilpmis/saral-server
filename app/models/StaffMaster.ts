//import { DateTime } from 'luxon'
//import { column } from '@ioc:Adonis/Lucid/Orm'
import Base from '#models/base'
import { column } from '@adonisjs/lucid/orm'

export default class StaffMaster extends Base {

    public static table = 'staff_role_master'

    @column()
    declare school_id: number

    @column()
    declare role: string

    @column()
    declare is_teaching_role: boolean

    @column()
    declare permissions: Object

}