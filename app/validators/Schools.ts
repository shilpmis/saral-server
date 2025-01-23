import vine from "@vinejs/vine";

/**
 * Validates the post's creation action
 */
export const CreateValidatorForSchools = vine.compile(
  vine.object({
      // add here
      name : vine.string().trim().maxLength(50),
      short_name : vine.string().trim().maxLength(10),
      email : vine.string().email(),
      address : vine.string().trim().minLength(3).maxLength(30).optional(),
      city : vine.string().trim().minLength(3).maxLength(30),
      state : vine.string().trim().minLength(3).maxLength(30),
      pincode: vine.number().min(6),
      phone : vine.number().min(6),
      subscription_type : vine.string(), 
      status : vine.enum(['ACTIVE', 'INACTIVE', 'PENDING', 'BLOCKED']),
      subscription_start_date : vine.string(),
      subscription_end_date : vine.string(),
  })
)


/**
 * Validates the post's update action
 */
export const UpdateValidatorForSchools = vine.compile(
  vine.object({
    
  })
)

