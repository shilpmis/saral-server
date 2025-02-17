import vine from "@vinejs/vine";

/**
 * Validates the post's creation action
 */
export const CreateValidatorForTeachers = vine.compile(

  vine.array(
    vine.object({
      // add here
      staff_role_id: vine.number(),
      first_name: vine.string().trim().minLength(2).maxLength(50),
      middle_name: vine.string().trim().minLength(2).maxLength(50).optional(),
      last_name: vine.string().trim().minLength(2).maxLength(50),

      gender: vine.enum(['Male', 'Female']),

      birth_date: vine.date(),

      mobile_number: vine.number(),
      email: vine.string().email(),

      class_id: vine.number(),

      qualification: vine.string(),
      joining_date: vine.date(),

      employment_status: vine.enum(['Permanent', 'Trial_period', 'Resigned', 'Contact_base', 'Notice_Period']),

    })
  )
)


/**
 * Validates the post's update action
 */
export const UpdateValidatorForTeachers = vine.compile(
  vine.object({

    staff_role_id: vine.number().optional(),
    first_name: vine.string().trim().minLength(2).maxLength(50).optional(),
    middle_name: vine.string().trim().minLength(2).maxLength(50).optional(),
    last_name: vine.string().trim().minLength(2).maxLength(50).optional(),

    gender: vine.enum(['Male', 'Female']).optional(),

    birth_date: vine.date().optional(),

    mobile_number: vine.number().optional(),
    email: vine.string().email().optional(),

    qualification: vine.string().optional(),
    joining_date: vine.date().optional(),
    employment_status: vine.enum(['Permanent', 'Trial_period', 'Resigned', 'Contact_base', 'Notice_Period']).optional(),

  })
)

