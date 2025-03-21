import { BaseModel, column } from "@adonisjs/lucid/orm";

export default class Quota extends BaseModel {
  @column({ isPrimary: true })
  declare id: number;

  @column()
  declare name: string;

  @column()
  declare description?: string;

  @column()
  declare eligibility_criteria?: string;
}
