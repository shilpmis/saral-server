//import { DateTime } from 'luxon'
//import { column } from '@ioc:Adonis/Lucid/Orm'
import Base from '#models/base'
import { beforeSave, column } from '@adonisjs/lucid/orm'
import { before } from 'node:test'

export default class Staff extends Base {

 @column()
 declare school_id : number

 @column()
 declare staff_role_id : number

 @column()
 declare first_name : string

 @column()
 declare middle_name : string

 @column()
 declare last_name : string

 @column()
 declare gender : 'Male'| 'Female'

 @column({
    serialize: (value: Date) => Base.serializeDateAsSQLDateString(value),
  })
 declare birth_date : Date

 @column()
 declare email : string

 @column({
    serialize: (value: Date) => Base.serializeDateAsSQLDateString(value),
  })
 declare joining_date : Date

 @column()
 declare employment_status : 'Permanent'| 'Trial_period'| 'Resigned'| 'Contact_base' | 'Notice_Period'
    
}