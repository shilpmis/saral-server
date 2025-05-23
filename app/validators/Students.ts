import vine from '@vinejs/vine'

export const CreateValidatorStundet = vine.compile(
  vine.object({
    students_data: vine.object({
      class_id: vine.number(),
      // enrollment_code : vine.string().trim().minLength(2).maxLength(50),
      admission_number: vine.string().trim().minLength(2).maxLength(50).nullable().optional(),
      first_name: vine.string().trim().minLength(2).maxLength(50),
      middle_name: vine.string().trim().minLength(2).maxLength(50).nullable().optional(),
      last_name: vine.string().trim().minLength(2).maxLength(50),

      first_name_in_guj: vine.string().trim().optional().nullable().optional(),
      middle_name_in_guj: vine.string().trim().optional().nullable().optional(),
      last_name_in_guj: vine.string().trim().optional().nullable().optional(),

      gender: vine.enum(['Male', 'Female']),

      birth_date: vine.date().nullable().optional(),

      /**
       * FIX : this should be unique in between school's students
       */
      gr_no: vine.number().positive().unique({ table: 'students', column: 'gr_no' }),

      primary_mobile: vine.number(),

      father_name: vine.string().trim().minLength(3).maxLength(50).nullable().optional(),
      father_name_in_guj: vine.string().trim().nullable().optional(),

      mother_name: vine.string().trim().minLength(3).maxLength(50).nullable().optional(),
      mother_name_in_guj: vine.string().trim().nullable().optional(),

      /**
       * FIX : make this optional or remove roll number from table in next migrtion
       *  */
      roll_number: vine.number().positive().nullable().optional(),

      aadhar_no: vine
        .number()
        // .unique({ table: 'students', column: 'aadhar_no' })
        .nullable()
        .optional(),

      is_active: vine.boolean(),
      remarks: vine.string().trim().nullable().optional(),
    }),
    student_meta_data: vine.object({
      aadhar_dise_no: vine
        .number()
        .positive()
        // .unique({ table: 'students_meta', column: 'aadhar_dise_no' })
        .nullable()
        .optional(),

      birth_place: vine.string().trim().minLength(2).maxLength(100).nullable().optional(),
      birth_place_in_guj: vine.string().trim().nullable().optional(),

      religion: vine.string().trim().minLength(2).maxLength(50).nullable().optional(),
      religion_in_guj: vine.string().trim().nullable().optional(),

      caste: vine.string().trim().minLength(2).maxLength(50).nullable().optional(),
      caste_in_guj: vine.string().trim().nullable().optional(),

      category: vine.enum(['ST', 'SC', 'OBC', 'OPEN']).nullable().optional(),

      blood_group: vine
        .enum(['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'])
        .nullable()
        .optional(),

      identification_mark: vine.string().trim().optional().nullable().optional(),

      residence_type: vine
        .enum(['day_scholar', 'residential', 'semi_residential'])
        .nullable()
        .optional(),

      admission_date: vine.date().nullable().optional(),

      admission_class_id: vine.number().nullable().optional(),

      secondary_mobile: vine.number().nullable().optional(),

      privious_school: vine.string().trim().nullable().optional(), //.minLength(5).maxLength(100).nullable().optional(),
      privious_school_in_guj: vine.string().trim().optional().nullable().optional(),

      address: vine.string().trim().minLength(5).maxLength(200).nullable().optional(),

      district: vine.string().trim().minLength(3).maxLength(100).nullable().optional(),
      city: vine.string().trim().minLength(3).maxLength(100).nullable().optional(),

      state: vine.string().trim().minLength(3).maxLength(50).nullable().optional(),

      postal_code: vine.string().trim().nullable().optional(),

      bank_name: vine.string().trim().nullable().optional(),

      account_no: vine.number().positive().nullable().optional(),

      IFSC_code: vine.string().trim().nullable().optional(),
    }),
  })
)

export const CreateValidatorForUpload = vine.compile(
  vine.object({
    students_data: vine.object({
      school_id: vine.number(),

      first_name: vine.string().trim().minLength(2).maxLength(50),
      middle_name: vine.string().trim().optional(),
      last_name: vine.string().trim().minLength(2).maxLength(50),

      first_name_in_guj: vine.string().trim().nullable(),
      middle_name_in_guj: vine.string().trim().nullable(),
      last_name_in_guj: vine.string().trim().nullable(),

      gender: vine.enum(['Male', 'Female']),

      birth_date: vine.date().optional(),

      /**
       * FIX : this should be unique in between school's students
       */
      gr_no: vine.number().positive(),

      primary_mobile: vine.number().nullable(),

      father_name: vine.string().trim().minLength(3).maxLength(50).nullable(),
      father_name_in_guj: vine.string().trim().nullable(),

      mother_name: vine.string().trim().minLength(3).maxLength(50).nullable(),
      mother_name_in_guj: vine.string().trim().nullable(),

      /**
       * FIX : make this optional or remove roll number from table in next migrtion
       *  */
      roll_number: vine.number().positive().nullable(),

      aadhar_no: vine.number().nullable(),

      is_active: vine.boolean(),
    }),
    student_meta_data: vine
      .object({
        aadhar_dise_no: vine
          .number()
          // .unique({ table: 'students_meta', column: 'aadhar_dise_no' })
          .nullable(),

        birth_place: vine.string().trim().minLength(2).maxLength(100).nullable(),
        birth_place_in_guj: vine.string().trim().nullable(),

        religion: vine.string().trim().minLength(2).maxLength(50).nullable(),
        religion_in_guj: vine.string().trim().nullable(),

        caste: vine.string().trim().minLength(2).maxLength(50).nullable(),
        caste_in_guj: vine.string().trim().nullable(),

        category: vine.enum(['ST', 'SC', 'OBC', 'OPEN']).nullable(),

        admission_date: vine.date().nullable(),

        admission_class_id: vine.number().nullable(),

        secondary_mobile: vine.number().nullable(),

        privious_school: vine.string().trim().minLength(2).maxLength(100).nullable().optional(),
        privious_school_in_guj: vine.string().trim().optional().nullable(),

        address: vine.string().trim().minLength(5).maxLength(200).nullable(),

        district: vine.string().trim().minLength(3).maxLength(100).nullable(),
        city: vine.string().trim().minLength(3).maxLength(100).nullable(),

        state: vine.string().trim().minLength(3).maxLength(50).nullable(),

        postal_code: vine.string().trim().nullable(),

        bank_name: vine.string().trim().nullable(),

        account_no: vine.number().positive().nullable(),

        IFSC_code: vine.string().trim().nullable(),
      })
      .optional(),
  })
)

export const CreateValidatorForMultipleStundets = vine.compile(
  vine
    .array(
      vine.object({
        // add here
        students_data: vine.object({
          first_name: vine.string().trim().minLength(2).maxLength(50),
          middle_name: vine.string().trim().minLength(2).maxLength(50).optional(),
          last_name: vine.string().trim().minLength(2).maxLength(50),

          first_name_in_guj: vine.string().trim().optional(),
          middle_name_in_guj: vine.string().trim().optional(),
          last_name_in_guj: vine.string().trim().optional(),

          gender: vine.enum(['Male', 'Female']),

          birth_date: vine.date().optional(),

          /**
           * FIX : this should be unique in between school's students
           */
          gr_no: vine.number().positive().unique({ table: 'students', column: 'gr_no' }),

          primary_mobile: vine.number(),

          father_name: vine.string().trim().minLength(3).maxLength(50),
          father_name_in_guj: vine.string().trim().optional(),

          mother_name: vine.string().trim().minLength(3).maxLength(50).optional(),
          mother_name_in_guj: vine.string().trim().optional(),

          /**
           * FIX : make this optional or remove roll number from table in next migrtion
           *  */
          roll_number: vine.number().positive().optional(),

          aadhar_no: vine.number(),

          is_active: vine.boolean(),
        }),
        student_meta_data: vine
          .object({
            // student_id: vine.number().exists({ table: 'students', column: 'id' }),

            aadhar_dise_no: vine
              .number()
              .positive()
              // .unique({ table: 'student_meta', column: 'aadhar_dise_no' })
              .optional(),

            birth_place: vine.string().trim().minLength(2).maxLength(100).optional(),
            birth_place_in_guj: vine.string().trim().optional(),

            religion: vine.string().trim().minLength(2).maxLength(50).optional(),
            religion_in_guj: vine.string().trim().optional(),

            caste: vine.string().trim().minLength(2).maxLength(50).optional(),
            caste_in_guj: vine.string().trim().optional(),

            category: vine.enum(['ST', 'SC', 'OBC', 'OPEN']).optional(),

            admission_date: vine.date().optional(),

            admission_class_id: vine.number().optional(),

            secondary_mobile: vine.number().optional(),

            privious_school: vine.string().trim().minLength(5).maxLength(100).optional(),
            privious_school_in_guj: vine.string().trim().optional().optional(),

            address: vine.string().trim().minLength(5).maxLength(200).optional(),

            district: vine.string().trim().minLength(3).maxLength(100).optional(),
            city: vine.string().trim().minLength(3).maxLength(100).optional(),

            state: vine.string().trim().minLength(3).maxLength(50).optional(),

            postal_code: vine.string().trim().optional(),
            // .check((value, field) => {
            //   if (!/^\d{6}$/.test(value)) {
            //     field.report('Postal code must be exactly 6 digits.')
            //   }
            // }),

            bank_name: vine.string().trim().optional(),

            account_no: vine.number().positive().optional(),

            IFSC_code: vine.string().trim().optional(),
            // .check((value, field) => {
            //   if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(value)) {
            //     field.report('Invalid IFSC code format.')
            //   }
            // }),
          })
          .optional(),
      })
    )
    .minLength(1)
)

/**
 * Validates the post's update action
 */
export const UpdateValidatorForStundets = vine.compile(
  vine.object({
    // add here
    students_data: vine
      .object({
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

        aadhar_no: vine.number().optional(),

        is_active: vine.boolean().optional(),
      })
      .optional(),

    student_meta_data: vine
      .object({
        // student_id: vine.number().exists({ table: 'students', column: 'id' }),

        aadhar_dise_no: vine
          .number()
          .positive()
          // .unique({ table: 'students_meta', column: 'aadhar_dise_no' })
          .optional(),

        birth_place: vine.string().trim().minLength(2).maxLength(100).optional(),
        birth_place_in_guj: vine.string().trim().optional(),

        religion: vine.string().trim().minLength(2).maxLength(50).optional(),
        religion_in_guj: vine.string().trim().optional(),

        caste: vine.string().trim().minLength(2).maxLength(50).optional(),
        caste_in_guj: vine.string().trim().optional().optional(),

        category: vine.enum(['ST', 'SC', 'OBC', 'OPEN']).optional(),

        admission_date: vine.date().optional(),

        /**
         * TODO :
         *    validation for verify class added is not greater then in which student acctualy in
         */
        admission_class_id: vine.number().optional(),

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

        IFSC_code: vine.string().trim().optional(),
      })
      .optional(),
  })
)

export const ValidationForExportStudents = vine.compile(
  vine.object({
    students: vine
      .array(
        vine.enum([
          'first_name',
          'middle_name',
          'last_name',
          'first_name_in_guj',
          'middle_name_in_guj',
          'last_name_in_guj',
          'gender',
          'birth_date',
          'aadhar_no',
          'gr_no',
        ])
      )
      .minLength(1),
    student_meta: vine
      .array(vine.enum(['birth_place', 'birth_place_in_guj', 'aadhar_dise_no']))
      .minLength(1),
  })
)


export const createStudentValidatorForOnBoarding = vine.compile(
  vine.object({
      // class_id: vine.number(),
      first_name: vine.string().trim().minLength(2).maxLength(50),
      middle_name: vine.string().trim().minLength(2).maxLength(50).nullable().optional(),
      last_name: vine.string().trim().minLength(2).maxLength(50),
      birth_date : vine.date().nullable().optional(),
      class_id : vine.number(),
      division_id : vine.number(),
      gender: vine.enum(['Male', 'Female']),
      primary_mobile : vine.number(),
      father_name: vine.string().trim().minLength(3).maxLength(50).nullable().optional(),
      academic_session_id : vine.number(),
  }))