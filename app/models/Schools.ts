//import { DateTime } from 'luxon'
//import { column } from '@ioc:Adonis/Lucid/Orm'
import { SubscriptionStatus, SubscriptionType } from '#enums/school.enum'
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

     @column()
     declare address: string

     @column()
     declare city: string

     @column()
     declare state: string

     @column()
     declare pincode: number

     @column()
     declare phone: number

     @column({
          consume: (value) => value || SubscriptionType.FREE, 
     })
     declare subscription_type: SubscriptionType;

     @column({serializeAs : null })
     declare is_email_verified: boolean

     @column({serializeAs : null })
     declare subscription_start_date: Date

     @column({serializeAs : null })
     declare subscription_end_date: Date

     @column({
          consume: (value) => value || SubscriptionStatus.PENDING, 
     })
     declare status: SubscriptionStatus
}