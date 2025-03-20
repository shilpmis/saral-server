import Base from '#models/base'
import { column, hasOne, manyToMany } from '@adonisjs/lucid/orm'
import { DateTime } from 'luxon'
import Schools from '#models/Schools'
import * as relations from '@adonisjs/lucid/types/relations'
import Students from './Students.js'

export default class AcademicSession extends Base {
  static table = 'academic_sessions'

  @column()
  declare school_id: number

  @column()
  declare session_name: string

  @column({
    serialize: (value: Date) => Base.serializeDateAsSQLDateString(value),
  })
  declare start_date: Date

  @column({
    serialize: (value: Date) => Base.serializeDateAsSQLDateString(value),
  })
  declare end_date: Date

  @column()
  declare start_month: string

  @column()
  declare end_month: string

  @column()
  declare start_year: string

  @column()
  declare end_year: string

  @column()
  declare is_active: boolean

  @hasOne(() => Schools, {
    localKey: 'school_id',
    foreignKey: 'id',
  })
  declare school: relations.HasOne<typeof Schools>

  @manyToMany(() => Students, {
    pivotTable: 'student_enrollments',
    pivotForeignKey: 'academic_sessions_id',
    pivotRelatedForeignKey: 'student_id',
  })
  declare students: relations.ManyToMany<typeof Students>
}