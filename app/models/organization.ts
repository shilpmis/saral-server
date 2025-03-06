import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'
import Base from './base.js'

export default class Organization extends Base {

  public static table = 'organization2'

  @column({ isPrimary: true })
  declare id: number

  @column({ isPrimary: true })
  declare name: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}