import { column } from "@adonisjs/lucid/orm";
import Base from "./base.js";

export default class Quota extends Base {
  @column({ isPrimary: true })
  declare id: number;

  @column()
  declare name: string;

  @column()
  declare description?: string;

  @column()
  declare eligibility_criteria?: string;
}
