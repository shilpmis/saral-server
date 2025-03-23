import Base from '#models/base'
import { belongsTo, column, hasOne } from '@adonisjs/lucid/orm'
import Students from './Students.js'
import type { BelongsTo, HasOne } from '@adonisjs/lucid/types/relations'
import Quota from './Quota.js'
import Classes from './Classes.js'

export default class StudentEnrollments extends Base {
  public static table = 'student_enrollments'

  @column()
  declare student_id: number

  @column()
  declare class_id: number

  @column()
  declare academic_session_id: number

  @column()
  declare quota_id: number

  @column()
  declare status: 'Permoted' | 'Failed' | 'Pursuing' | 'Admitted'

  @column()
  declare remarks: string

  @column()
  declare type: 'New Admission' | 'Existing Student'

  @belongsTo(() => Students, {
    foreignKey: 'student_id',
    localKey: 'id',
  })
  declare student: BelongsTo<typeof Students>

  @belongsTo(() => Quota)
  declare quota: BelongsTo<typeof Quota>

  @hasOne(() => Classes, {
    foreignKey: 'id',
    localKey: 'class_id',
  })
  declare class: HasOne<typeof Classes>
}
