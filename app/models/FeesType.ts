import { column } from '@adonisjs/lucid/orm'
import Base from './base.js'

export default class FeesType extends Base {
  
  public static table = 'fees_types'
  
  @column()
  declare school_id: number
  
  @column()
  declare academic_year_id: number
  
  @column()
  declare name: string

  @column()
  declare description: string

  @column()
  declare status: string

}