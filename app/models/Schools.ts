//import { DateTime } from 'luxon'
//import { column } from '@ioc:Adonis/Lucid/Orm'
import Base from '#models/base'
import { column } from '@adonisjs/lucid/orm'

export default class Schools extends Base {

     public static table = 'school'
    
     @column()
     declare name : string
    
     @column()
     declare short_name : string

     @column()
     declare email: string

     @column({serializeAs : null })
     declare address: string

     @column()
     declare city: string

     @column()
     declare state: string

     @column({serializeAs : null })
     declare pincode: number

     @column({serializeAs : null })
     declare phone: number

     @column({serializeAs : null })
     declare subscription_type: string

     @column({serializeAs : null })
     declare is_email_verified: boolean

     @column({serializeAs : null })
     declare subscription_start_date: string

     @column({serializeAs : null })
     declare subscription_end_date: string

     @column()
     declare status : 'ACTIVE' | 'INACTIVE' | 'PENDING' | 'BLOCKED'
     
}