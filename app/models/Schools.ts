import Base from '#models/base'
import { column } from '@adonisjs/lucid/orm'
import { DateTime } from 'luxon'

export default class Schools extends Base {

     public static table = 'schools'

     @column({ isPrimary: true })
     declare id: number
    
     @column()
     declare organization_id: number

     @column()
     declare name : string

     @column()
     declare email: string

     @column()
     declare branch_code: string   

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

     @column({serializeAs : null})
     declare is_email_verified: boolean

     @column()
     declare status : 'ACTIVE' | 'INACTIVE'
     
     @column()
     declare district: string
   
     @column()
     declare city: string
     
     @column()
     declare pincode: number
   
     @column()
     declare state: string
   
     @column()
     declare school_logo: string | null
     
     @column.dateTime({ autoCreate: true })
     declare created_at: DateTime
   
     @column.dateTime({ autoCreate: true, autoUpdate: true })
     declare updated_at: DateTime
}