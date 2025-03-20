import { belongsTo, column } from "@adonisjs/lucid/orm";
import Base from "./base.js";
import * as relations from "@adonisjs/lucid/types/relations";
import Schools from "./Schools.js";
import AcademicSession from "./AcademicSession.js";
import ClassSeatAvailability from "./ClassSeatAvailability.js";
import Quota from "./Quota.js";
import User from "./User.js";


export default class AdmissionInquiry extends Base {
  public static table = 'admission_inquiries';

  @column()
  declare school_id: number;

  @column()
  declare academic_id: number;

  @column()
  declare student_name: string;

  @column()
  declare dob: Date;

  @column()
  declare gender: 'male' | 'female' | 'other';

  @column()
  declare class_applying: number;

  @column()
  declare parent_name: string;

  @column()
  declare parent_contact: string;

  @column()
  declare parent_email: string | null;

  @column()
  declare address: string;

  // Previous School Details
  @column()
  declare previous_school: string | null;

  @column()
  declare previous_class: string | null;

  @column()
  declare previous_percentage: string | null;

  @column()
  declare previous_year: string | null;

  @column()
  declare special_achievements: string | null;

  // Quota Details
  @column()
  declare applying_for_quota: boolean;

  @column()
  declare quota_type: number | null;

  @column()
  declare status: 'pending' | 'eligible' | 'approved' | 'ineligible';

  @column()
  declare admin_notes: string | null;

  @column()
  declare created_by: number;

  @column()
  declare is_converted_to_student: boolean;

  // **Relationships**
  @belongsTo(() => Schools, { foreignKey: 'school_id' })
  declare school: relations.BelongsTo<typeof Schools>;

  @belongsTo(() => AcademicSession, { foreignKey: 'academic_id' })
  declare academic_session: relations.BelongsTo<typeof AcademicSession>;

  @belongsTo(() => ClassSeatAvailability, { foreignKey: 'class_applying' })
  declare class_seat_availability: relations.BelongsTo<typeof ClassSeatAvailability>;

  @belongsTo(() => Quota, { foreignKey: 'quota_type' })
  declare quota: relations.BelongsTo<typeof Quota>;

  @belongsTo(() => User, { foreignKey: 'created_by' })
  declare created_by_user: relations.BelongsTo<typeof User>;
}
