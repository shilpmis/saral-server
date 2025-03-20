import { column } from '@adonisjs/lucid/orm'
import Base from '#models/base'

export default class Organization extends Base {
  @column()
  declare name: string

  @column()
  declare email: string

  @column()
  declare contact_number: number

  @column()
  declare subscription_type: 'FREE' | 'PREMIUM'


  @column({
    serialize: (value: Date) => Base.serializeDateAsSQLDateString(value),
    serializeAs: null
  })
  declare subscription_start_date: Date


  @column({
    serialize: (value: Date) => Base.serializeDateAsSQLDateString(value),
    serializeAs: null
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
  declare head_name: string | null

  @column()
  declare head_contact_number: number

  @column()
  declare district: string | null

  @column()
  declare city: string

  @column()
  declare state: string

  @column()
  declare pincode: number | null

}