import { BaseModel, belongsTo, column } from "@adonisjs/lucid/orm";
import Classes from "./Classes.js";
import * as relations from "@adonisjs/lucid/types/relations";
import QuotaAllocation from "./QuotaAllocation.js";


export default class ClassSeatAvailability extends BaseModel {
  @column()
  declare class_id: number;

  @column()
  declare quota_seat_allocated_id: number;

  @column()
  declare total_seats: number;

  @column()
  declare quota_allocated_seats: number;

  @column()
  declare general_available_seats: number;

  @column()
  declare filled_seats: number;

  @column()
  declare remaining_seats: number;

  @belongsTo(() => Classes, { foreignKey: 'class_id' })
  declare class: relations.BelongsTo<typeof Classes>;

  @belongsTo(() => QuotaAllocation, { foreignKey: 'quota_seat_allocated_id' })
  declare quota_allocation: relations.BelongsTo<typeof QuotaAllocation>;
}
