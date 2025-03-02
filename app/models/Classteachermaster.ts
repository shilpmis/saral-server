import { column } from '@adonisjs/lucid/orm'
import Base from './base.js'

export default class ClassTeacherMaster extends Base {
  
  @column()
  declare school_id: number

  @column()
  declare class_id: number

  @column()
  declare teacher_id: number

}