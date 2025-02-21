//import { DateTime } from 'luxon'
//import { column } from '@ioc:Adonis/Lucid/Orm'
import Base from '#models/base'
import { column } from '@adonisjs/lucid/orm'

export default class LeavePolicies extends Base {

    @column()
    declare staff_role_id : number

    @column()
    declare leave_type_id : number

    @column()
    declare annual_quota : number

    @column()
    declare can_carry_forward : boolean

    @column()
    declare max_carry_forward_days : number

    @column()
    declare max_consecutive_days : number

    @column()
    declare requires_approval : boolean

    @column()
    declare deduction_rules : JSON

    @column()
    declare approval_hierarchy : JSON

    @column()
    declare is_active : boolean

}