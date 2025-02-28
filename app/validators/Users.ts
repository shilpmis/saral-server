import vine from "@vinejs/vine";

/**
 * Validates the post's creation action
 */
export const CreateValidatorForUsers = vine.compile(
  vine.object({

      name : vine.string().trim().minLength(3).maxLength(30),
      username : vine.string().trim().minLength(3).maxLength(30).unique({table : 'users' ,column : 'username'}),
      // password : vine.string().trim().minLength(8).maxLength(30), 
      role_id : vine.number(),
      // is_active : vine.boolean(),
  })
)


/**
 * Validates the post's update action
 */
export const UpdateValidatorForUsers = vine.compile(
  vine.object({
    name : vine.string().trim().minLength(3).maxLength(30).optional(),
    is_active : vine.boolean(),

    /**
     * Password should not be update thay easily
     */
    // password : vine.string().trim().minLength(8).maxLength(30), 
  })
)

