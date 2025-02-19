import vine from "@vinejs/vine";

/**
 * Validates the post's creation action
 */
export const CreateValidatorForOtherStaff = vine.compile(

  vine.array(
    vine.object({
      // add here
      staff_role_id: vine.number(),
      first_name: vine.string().trim().minLength(2).maxLength(50),
      middle_name: vine.string().trim().minLength(2).maxLength(50),
      last_name: vine.string().trim().minLength(2).maxLength(50),
     
      first_name_in_guj: vine.string().trim().minLength(2).maxLength(50),
      middle_name_in_guj: vine.string().trim().minLength(2).maxLength(50),
      last_name_in_guj: vine.string().trim().minLength(2).maxLength(50),

      aadhar_no: vine.number()
        .unique({ table: 'other_staff', column: 'aadhar_no' }),

      religiion: vine.string().trim().minLength(2).maxLength(50),
      religiion_in_guj: vine.string().trim().optional(),
  
      caste: vine.string().trim().minLength(2).maxLength(50),
      caste_in_guj: vine.string().trim().optional(),
  
      category: vine.enum(['ST', 'SC', 'OBC', 'OPEN']),

      address: vine.string().trim().minLength(5).maxLength(200),
  
      district: vine.string().trim().minLength(3).maxLength(100),
      city: vine.string().trim().minLength(3).maxLength(100),
  
      state: vine.string().trim().minLength(3).maxLength(50),
  
      postal_code: vine.number(),
      
      bank_name: vine.string().trim(),
      
      account_no: vine.number().positive(),
  
      IFSC_code: vine.string().trim(),

      gender: vine.enum(['Male', 'Female']),

      birth_date: vine.date(),

      mobile_number: vine.number(),
      email: vine.string().email(),
      joining_date: vine.date(),

      employment_status: vine.enum(['Permanent', 'Trial_period', 'Resigned', 'Contact_base', 'Notice_Period']),

    })
  )
)


/**
 * Validates the post's update action
 */
export const UpdateValidatorForOtherStaff = vine.compile(
  vine.object({

    staff_role_id: vine.number().optional(),
    first_name: vine.string().trim().minLength(2).maxLength(50).optional(),
    middle_name: vine.string().trim().minLength(2).maxLength(50).optional(),
    last_name: vine.string().trim().minLength(2).maxLength(50).optional(),

    gender: vine.enum(['Male', 'Female']).optional(),

    birth_date: vine.date().optional(),

    mobile_number: vine.number().optional(),
    email: vine.string().email().optional(),

    joining_date: vine.date().optional(),
    employment_status: vine.enum(['Permanent', 'Trial_period', 'Resigned', 'Contact_base', 'Notice_Period']).optional(),

  })
)

