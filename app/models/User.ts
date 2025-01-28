import Base from './base.js'
import { DateTime } from 'luxon'
import { beforeSave, column, hasOne } from '@adonisjs/lucid/orm'
import { DbAccessTokensProvider } from '@adonisjs/auth/access_tokens'
import hash from '@adonisjs/core/services/hash'
import Schools from '#models/Schools'
import type { HasOne } from '@adonisjs/lucid/types/relations'
import { RoleType } from '#enums/user.enum'

export default class User extends Base {

  @column()
  declare school_id : string

  @column()
  declare name : string

  @column()
  declare username : string

  @column()
  declare saral_email : string
  
  @column({serializeAs : null })
  declare password : string
  
  @column({consume : (value) => value })
  declare role : RoleType
  
  @column.dateTime({ autoCreate: true , serializeAs : null })
  declare last_login: DateTime

  @hasOne(() => Schools , {
    localKey : 'school_id',
    foreignKey : 'id'
  })
  declare school : HasOne<typeof Schools>

  @beforeSave()
  static async hashPassword(user: User) {
    if (user.$dirty.password) {
      user.password = await hash.make(user.password)
    }
  }
  
  static accessTokens = DbAccessTokensProvider.forModel(User);
  
}