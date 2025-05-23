import vine from "@vinejs/vine";

/**
 * Validates the post's creation action
 */
export const CreateValidatorForSubject = vine.compile(
  vine.object({
    // add here
    name: vine.string().trim().minLength(3).maxLength(255),
    // code: vine.string().trim().minLength(3).maxLength(255),
    description: vine.string().trim().maxLength(255).optional(),
    academic_session_id: vine.number()
  })
)


/**
 * Validates the post's update action
 */
export const UpdateValidatorForSubject = vine.compile(
  vine.object({
    description: vine.string().trim().maxLength(255).optional(),
    status : vine.enum(['Active', 'Inactive']).optional(),
  })
)


export const CreateValidatorForAssignSubject = vine.compile(
  
  vine.object ({
    division_id: vine.number(),
    academic_session_id: vine.number(),
    subjects : vine.array(
      vine.object({
        // add here
        subject_id: vine.number(),
        code_for_division: vine.string().trim().minLength(3).maxLength(255),
        description: vine.string().trim().maxLength(255).optional(),
      })
    ).minLength(1),
  })
)

export const updateValidatorForAssignSubject = vine.compile(
  vine.object({
    // add here
    code_for_division: vine.string().trim().minLength(3).maxLength(255).optional(),
    status : vine.enum(['Active', 'Inactive']).optional(),
    description: vine.string().trim().maxLength(255).optional()
  })
)



export const CreateValidatorForAssignSubjectToStaff = vine.compile(
  
  vine.object ({
    subjects_division_id: vine.number(),
    staff_enrollment_ids: vine.array(vine.number()).minLength(1),
    notes : vine.string().trim().maxLength(255).optional(),    
  })
)