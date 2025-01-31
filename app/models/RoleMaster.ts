//import { DateTime } from 'luxon'
//import { column } from '@ioc:Adonis/Lucid/Orm'
import Base from '#models/base'
import { column } from '@adonisjs/lucid/orm'

export default class RoleMaster extends Base {

    public static table = 'role_master'
    
    @column()
    declare role : string

    @column()
    declare permissions : Object
}