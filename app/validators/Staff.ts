import vine from "@vinejs/vine";

/**
 * Validates the post's creation action
 */
export const CreateValidatorForStaff = vine.compile(
  vine.object({
    academic_id: vine.number(),
    remarks: vine.string().trim().minLength(2).maxLength(255).optional(),
    employee_code: vine.string().trim().minLength(2).maxLength(50),
    school_id: vine.number(),
    is_active: vine.boolean(),
    is_teaching_role: vine.boolean(),
    staff_role_id: vine.number(),

    first_name: vine.string().trim().minLength(2).maxLength(50),
    middle_name: vine.string().trim().minLength(2).maxLength(50).optional(),
    last_name: vine.string().trim().minLength(2).maxLength(50),

    first_name_in_guj: vine.string().trim().minLength(2).maxLength(50).optional(),
    middle_name_in_guj: vine.string().trim().minLength(2).maxLength(50).optional(),
    last_name_in_guj: vine.string().trim().minLength(2).maxLength(50).optional(),

    gender: vine.enum(['Male', 'Female']),
    marital_status: vine.enum(['Single', 'Married', 'Divorced', 'Widowed']),

    birth_date: vine.date(),

    mobile_number: vine.number(),
    email: vine.string().email(),

    emergency_contact_name: vine.string().trim().minLength(2).maxLength(50),
    emergency_contact_number: vine.number(),

    qualification: vine.enum([
      'D.Ed', 'B.Ed', 'M.Ed', 'B.A + B.Ed', 'B.Sc + B.Ed', 'M.A + B.Ed', 'M.Sc + B.Ed', 'Ph.D', 'Diploma', 'B.Com', 'BBA', 'MBA', 'M.Com', 'ITI', 'SSC', 'HSC', 'Others'
    ]),

    subject_specialization: vine.enum([
      'Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'Hindi', 'Gujarati', 'Social Science', 'Computer Science', 'Commerce', 'Economics', 'Physical Education', 'Arts', 'Music', 'Others'
    ]).optional(),

    joining_date: vine.date(),

    employment_status: vine.enum(['Permanent', 'Trial_period', 'Resigned', 'Contact_base', 'Notice_Period']),
    experience_years: vine.number(),

    aadhar_no: vine.number(),
    pan_card_no: vine.string().trim().minLength(10).maxLength(10),
    epf_no: vine.number().optional(),
    epf_uan_no: vine.number().optional(),

    blood_group: vine.enum(['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-']),
    religion: vine.string().trim().minLength(2).maxLength(50),
    religion_in_guj: vine.string().trim().minLength(2).maxLength(50),
    caste: vine.string().trim().minLength(2).maxLength(50),
    caste_in_guj: vine.string().trim().minLength(2).maxLength(50),
    category: vine.enum(['ST', 'SC', 'OBC', 'OPEN']),
    nationality: vine.string().trim().minLength(2).maxLength(50),

    address: vine.string().trim().minLength(2).maxLength(255),
    district: vine.string().trim().minLength(2).maxLength(50),
    city: vine.string().trim().minLength(2).maxLength(50),
    state: vine.string().trim().minLength(2).maxLength(50),
    postal_code: vine.number(),

    bank_name: vine.string().trim().minLength(2).maxLength(50),
    account_no: vine.number(),
    IFSC_code: vine.string().trim().minLength(11).maxLength(11),

    profile_photo: vine.string().optional()
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

