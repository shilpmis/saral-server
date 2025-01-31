import vine from "@vinejs/vine";

/**
 * Validates the post's creation action
 */
export const CreateValidatorForUsers = vine.compile(
  vine.object({

      name : vine.string().trim().minLength(3).maxLength(30),
      username : vine.string().trim().minLength(3).maxLength(30).unique({table : 'users' ,column : 'username'}),
      password : vine.string().trim().minLength(8).maxLength(30), 
      role_id : vine.number(),

     // blow fields are added in req body from controller itself 

      // school_id , saral_email , last_login
  })
)


/**
 * Validates the post's update action
 */
export const UpdateValidatorForUsers = vine.compile(
  vine.object({
    name : vine.string().trim().minLength(3).maxLength(30).optional(),
    role_id : vine.number().optional(),
    // username : vine.string().trim().minLength(3).maxLength(30).unique({table : 'users' ,column : 'username'}).optional(),

    /**
     * Password should not be update thay easily
     */
    // password : vine.string().trim().minLength(8).maxLength(30), 
  })
)

