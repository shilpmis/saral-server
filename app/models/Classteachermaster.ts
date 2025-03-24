import Base from '#models/base'
import { column, hasOne } from '@adonisjs/lucid/orm'
import Classes from './Classes.js'
import type { HasOne } from '@adonisjs/lucid/types/relations'

export default class ClassTeacherMaster extends Base {
  @column()
  declare academic_session_id: number

  @column()
  declare class_id: number

  @column()
  declare staff_id: number

  @column()
  declare status: 'Active' | 'Inactive'

  @hasOne(() => Classes, {
    localKey: 'class_id',
    foreignKey: 'id',
  })
  declare class: HasOne<typeof Classes>
}
