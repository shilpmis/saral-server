//import { DateTime } from 'luxon'
//import { column } from '@ioc:Adonis/Lucid/Orm'
import Base from '#models/base'
import { column } from '@adonisjs/lucid/orm'
import { DateTime } from 'luxon'

export default class Schools extends Base {

     public static table = 'school'
    
     @column()
     declare name : string

     @column()
     declare email: string

     // @column({serializeAs : null})
     // declare password : string
     
     @column()
     declare username : string
     
     @column()
     declare contact_number: number

     @column()
     declare subscription_type: 'FREE' | 'PREMIUM'

     @column()
     declare subscription_start_date: Date

     @column()
     declare subscription_end_date: Date

     @column()
     declare is_email_verified: boolean

     @column()
     declare status : 'ACTIVE' | 'INACTIVE'
     
}