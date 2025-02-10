import vine from "@vinejs/vine";

/**
 * Validates the post's creation action
 */
export const CreateValidatorForStaff = vine.compile(

  vine.object({
    // add here
    staff_role_id: vine.number(),

    first_name: vine.string().trim().minLength(2).maxLength(50),
    middle_name: vine.string().trim().minLength(2).maxLength(50).optional(),
    last_name: vine.string().trim().minLength(2).maxLength(50),

    gender: vine.enum(['Male', 'Female']),

    birth_date: vine.date(),

    email: vine.string().email(),

    joining_date: vine.date(),

    employment_status: vine.enum(['Permanent', 'Trial_period', 'Resigned', 'Contact_base', 'Notice_Period'])

  })
)

export const CreateValidatorForMultipleStaff = vine.compile(

  vine.array(
    vine.object({
      // add here
      staff_role_id: vine.number(),

      first_name: vine.string().trim().minLength(2).maxLength(50),
      middle_name: vine.string().trim().minLength(2).maxLength(50).optional(),
      last_name: vine.string().trim().minLength(2).maxLength(50),

      gender: vine.enum(['Male', 'Female']),

      birth_date: vine.date(),

      email: vine.string().email(),

      joining_date: vine.date(),

      employment_status: vine.enum(['Permanent', 'Trial_period', 'Resigned', 'Contact_base', 'Notice_Period'])

    })
  ).minLength(1)
)


/**
 * Validates the post's update action
 */
export const UpdateValidatorForStaff = vine.compile(
  vine.object({

    first_name: vine.string().trim().minLength(2).maxLength(50).optional(),
    middle_name: vine.string().trim().minLength(2).maxLength(50).optional(),
    last_name: vine.string().trim().minLength(2).maxLength(50).optional(),

    gender: vine.enum(['Male', 'Female']).optional(),

    birth_date: vine.date().optional(),

    email: vine.string().email().optional(),

    joining_date: vine.date().optional(),

    employment_status: vine.enum(['Permanent', 'Trial_period', 'Resigned', 'Contact_base', 'Notice_Period']).optional()

  })
)

