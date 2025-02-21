import Base from '#models/base'
import { column } from '@adonisjs/lucid/orm'

export default class Schools extends Base {

     public static table = 'schools'
    
     @column()
     declare name : string

     @column()
     declare email: string

     @column()
     declare established_year: string

     @column()
     declare school_type: 'Public' | 'Private' | 'Charter'

     @column()
     declare username : string
     
     @column()
     declare contact_number: number
     
     @column()
     declare address: string

     @column()
     declare subscription_type: 'FREE' | 'PREMIUM'

     @column({
          serialize: (value: Date) => Base.serializeDateAsSQLDateString(value),
          serializeAs : null
        })
     declare subscription_start_date: Date

     @column({
          serialize: (value: Date) => Base.serializeDateAsSQLDateString(value),
          serializeAs : null     
        })
     declare subscription_end_date: Date

     @column({serializeAs : null})
     declare is_email_verified: boolean

     @column()
     declare status : 'ACTIVE' | 'INACTIVE'
     
}