import vine from "@vinejs/vine";

/**
 * Validates the post's creation action
 */
export const CreateValidatorForUsers = vine.compile(
  vine.object({
      // add here
      school_id : vine.number().positive(),
      username : vine.string().trim().minLength(3).maxLength(30),
      password : vine.string().trim().minLength(8).maxLength(30), 
      role : vine.enum(['admin', 'clerk', 'it_admin', 'principal']),

      // blow fields are added in req body from controller itself 

      // school_id , saral_email , last_login
  })
)


/**
 * Validates the post's update action
 */
export const UpdateValidatorForUsers = vine.compile(
  vine.object({

  })
)

