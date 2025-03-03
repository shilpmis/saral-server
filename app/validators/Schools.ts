import vine from "@vinejs/vine";

/**
 * Validates the post's creation action
 */
export const CreateValidatorForSchools = vine.compile(
  vine.object({
    // add here
    name: vine.string().trim().maxLength(50),
    email: vine.string().email().unique({ table: 'schools', column: 'email' }),
    established_year: vine.string(),
    school_type: vine.enum(['Public', 'Private', 'Charter']),
    username: vine.string().trim().unique({ table: 'schools', column: 'username' }).maxLength(10),
    contact_number: vine.number().min(10),
    address: vine.string().maxLength(500),
    subscription_type: vine.enum(['FREE', 'PREMIUM']),
    status: vine.enum(['ACTIVE', 'INACTIVE']),
    subscription_start_date: vine.date(),
    subscription_end_date: vine.date(),
  })
)


/**
 * Validates the post's update action
 */
export const UpdateValidatorForSchools = vine.compile(
  vine.object({
    name: vine.string().trim().maxLength(50).optional(),
    established_year: vine.string().optional(),
    school_type: vine.enum(['Public', 'Private', 'Charter']).optional(),
    contact_number: vine.number().min(10).optional(),
    address: vine.string().maxLength(500).optional(),
    // subscription_type: vine.enum(['FREE', 'PREMIUM']).optional(),

  })
)

