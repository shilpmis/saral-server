import Base from '#models/base'
import { belongsTo, column, hasOne } from '@adonisjs/lucid/orm'
import Students from './Students.js'
import type { BelongsTo, HasOne } from '@adonisjs/lucid/types/relations'
import Quota from './Quota.js'
// import Classes from './Classes.js'
import Divisions from './Divisions.js'

export default class StudentEnrollments extends Base {
  public static table = 'student_enrollments'

  @column()
  declare student_id: number

  @column()
  declare division_id: number

  @column()
  declare academic_session_id: number

  @column()
  declare quota_id: number

  @column()
  declare status: 'pursuing' | 'permoted' | 'failed' | 'drop'

  @column()
  declare remarks: string

  @column()
  declare is_new_admission: boolean

  @belongsTo(() => Students, {
    foreignKey: 'student_id',
    localKey: 'id',
  })
  declare student: BelongsTo<typeof Students>

  @belongsTo(() => Quota)
  declare quota: BelongsTo<typeof Quota>

  @hasOne(() => Divisions, {
    foreignKey: 'id',
    localKey: 'division_id',
  })
  declare class: HasOne<typeof Divisions>
}
