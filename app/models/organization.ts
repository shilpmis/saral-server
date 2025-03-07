import { column } from '@adonisjs/lucid/orm'
import { DateTime } from 'luxon'
import Base from '#models/base'

export default class Organization extends Base {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare name: string

  @column()
  declare email: string

  @column()
  declare username: string

  @column()
  declare contact_number: bigint

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

  @column()
  declare is_email_verified: boolean

  @column()
  declare status: 'ACTIVE' | 'INACTIVE'

  @column()
  declare organization_logo: string | null

  @column()
  declare established_year: string

  @column()
  declare address: string | null

  @column()
  declare head_name: string

  @column()
  declare head_contact_number: bigint

  @column()
  declare district: string

  @column()
  declare city: string

  @column()
  declare state: string

  @column()
  declare pincode: bigint

  @column.dateTime({ autoCreate: true })
  declare created_at: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updated_at: DateTime
}