import { BaseModel, column } from '@adonisjs/lucid/orm'
import Base from './base.js'

export default class FeesPlan extends Base {
   
  public static table = 'fees_plans'

  @column()
  declare academic_year_id: number
  
  @column()
  declare class_id: number
  
  @column()
  declare name : string
  
  @column()
  declare description : string
  
  @column()
  declare total_amount : number
  
  @column()
  declare status : 'Active' | 'Inactive'


}