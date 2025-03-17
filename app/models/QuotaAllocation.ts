import { BaseModel, belongsTo, column } from "@adonisjs/lucid/orm";
import * as relations from "@adonisjs/lucid/types/relations";
import Quota from "./Quota.js";
import Classes from "./Classes.js";


export default class QuotaAllocation extends BaseModel {

  @column()
  declare quota_id: number;

  @column()
  declare class_id: number;

  @column()
  declare total_seats: number;

  @column()
  declare filled_seats: number;

  @belongsTo(() => Quota)
  declare quota: relations.BelongsTo<typeof Quota>;

  @belongsTo(() => Classes)
  declare class: relations.BelongsTo<typeof Classes>;
}
