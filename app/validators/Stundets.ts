import vine from "@vinejs/vine";

/**
 * Validates the post's creation action
 */
export const CreateValidatorForStundets = vine.compile(

  vine.array(vine.object({
    // add here
    students_data: vine.object({
      first_name: vine.string().trim().minLength(2).maxLength(50),
      middle_name: vine.string().trim().minLength(2).maxLength(50).optional(),
      last_name: vine.string().trim().minLength(2).maxLength(50),

      first_name_in_guj: vine.string().trim().optional(),
      middle_name_in_guj: vine.string().trim().optional(),
      last_name_in_guj: vine.string().trim().optional(),

      gender: vine.enum(['Male', 'Female']),

      birth_date: vine.date(),

      /**
       * FIX : this should be unique in between school's students
       */
      gr_no: vine.number().positive().unique({ table: 'students', column: 'gr_no' }),

      primary_mobile: vine.number(),

      father_name: vine.string().trim().minLength(3).maxLength(50),
      father_name_in_guj: vine.string().trim().optional(),

      mother_name: vine.string().trim().minLength(3).maxLength(50),
      mother_name_in_guj: vine.string().trim().optional(),

      /**
       * FIX : make this optional or remove roll number from table in next migrtion 
       *  */ 
      roll_number: vine.number().positive(),

      aadhar_no: vine.number()
        .unique({ table: 'students', column: 'aadhar_no' }),

      is_active: vine.boolean(),
    }),
    student_meta_data: vine.object({

      // student_id: vine.number().exists({ table: 'students', column: 'id' }),
  
      aadhar_dise_no: vine.number().positive().unique({ table: 'student_meta', column: 'aadhar_dise_no' }),
  
      birth_place: vine.string().trim().minLength(2).maxLength(100),
      birth_place_in_guj: vine.string().trim().optional(),
  
      religiion: vine.string().trim().minLength(2).maxLength(50),
      religiion_in_guj: vine.string().trim().optional(),
  
      caste: vine.string().trim().minLength(2).maxLength(50),
      caste_in_guj: vine.string().trim().optional(),
  
      category: vine.enum(['ST', 'SC', 'OBC', 'OPEN']),
  
      admission_date: vine.date(),
  
      admission_class_id : vine.number(),
  
      secondary_mobile: vine.number(),
  
      privious_school: vine.string().trim().minLength(5).maxLength(100),
      privious_school_in_guj: vine.string().trim().optional(),
  
      address: vine.string().trim().minLength(5).maxLength(200),
  
      district: vine.string().trim().minLength(3).maxLength(100),
      city: vine.string().trim().minLength(3).maxLength(100),
  
      state: vine.string().trim().minLength(3).maxLength(50),
  
      postal_code: vine.string().trim(),
      // .check((value, field) => {
      //   if (!/^\d{6}$/.test(value)) {
      //     field.report('Postal code must be exactly 6 digits.')
      //   }
      // }),
  
      bank_name: vine.string().trim(),
      
      account_no: vine.number().positive(),
  
      IFSC_code: vine.string().trim()
      // .check((value, field) => {
      //   if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(value)) {
      //     field.report('Invalid IFSC code format.')
      //   }
      // }),
    })
  
  })).minLength(1)
)


/**
 * Validates the post's update action
 */
export const UpdateValidatorForStundets = vine.compile(
  vine.object({
    // add here
    students_data: vine.object({

      first_name: vine.string().trim().minLength(2).maxLength(50).optional(),
      middle_name: vine.string().trim().minLength(2).maxLength(50).optional(),
      last_name: vine.string().trim().minLength(2).maxLength(50).optional(),

      first_name_in_guj: vine.string().trim().optional(),
      middle_name_in_guj: vine.string().trim().optional(),
      last_name_in_guj: vine.string().trim().optional(),

      gender: vine.enum(['Male', 'Female']).optional(),

      birth_date: vine.date().optional(),

      /**
       * FIX : this should be unique in between school's students
       */
      gr_no: vine.number().positive().unique({ table: 'students', column: 'gr_no' }).optional(),

      primary_mobile: vine.number().optional(),

      father_name: vine.string().trim().minLength(3).maxLength(50).optional(),
      father_name_in_guj: vine.string().trim().optional(),

      mother_name: vine.string().trim().minLength(3).maxLength(50).optional(),
      mother_name_in_guj: vine.string().trim().optional(),

      /**
       * FIX : make this optional or remove roll number from table in next migrtion 
       *  */ 
      roll_number: vine.number().positive().optional(),

      aadhar_no: vine.number()
        .unique({ table: 'students', column: 'aadhar_no' }).optional(),

      is_active: vine.boolean().optional(),
    }).optional(),

    student_meta_data: vine.object({

      // student_id: vine.number().exists({ table: 'students', column: 'id' }),
  
      aadhar_dise_no: vine.number().positive().unique({ table: 'student_meta', column: 'aadhar_dise_no' }).optional(),
  
      birth_place: vine.string().trim().minLength(2).maxLength(100).optional(),
      birth_place_in_guj: vine.string().trim().optional(),
  
      religiion: vine.string().trim().minLength(2).maxLength(50).optional(),
      religiion_in_guj: vine.string().trim().optional(),
  
      caste: vine.string().trim().minLength(2).maxLength(50).optional(),
      caste_in_guj: vine.string().trim().optional().optional(),
  
      category: vine.enum(['ST', 'SC', 'OBC', 'OPEN']).optional(),
  
      admission_date: vine.date().optional(),
  
      /**
       * TODO :
       *    validation for verify class added is not greater then in which student acctualy in  
       */
      admission_class_id : vine.number().optional(),

  
      secondary_mobile: vine.number().optional(),
  
      privious_school: vine.string().trim().minLength(2).maxLength(100).optional(),
      privious_school_in_guj: vine.string().trim().optional().optional(),
  
      address: vine.string().trim().minLength(5).maxLength(200).optional(),
  
      district: vine.string().trim().minLength(5).maxLength(100).optional(),
      city: vine.string().trim().minLength(5).maxLength(100).optional(),
  
      state: vine.string().trim().minLength(2).maxLength(50).optional(),
  
      postal_code: vine.string().trim().optional(),
  
      bank_name: vine.string().trim().optional(),
      
      account_no: vine.number().positive().optional(),
  
      IFSC_code: vine.string().trim().optional()
    }).optional()
  
  })
)

