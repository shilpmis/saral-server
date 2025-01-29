import vine from "@vinejs/vine";

/**
 * Validates the post's creation action
 */
export const CreateValidatorForSchools = vine.compile(
  vine.object({
      // add here
      name : vine.string().trim().maxLength(50),
      username : vine.string().trim().unique({table : 'school' , column : 'username'}).maxLength(10),
      email : vine.string().email().unique({table : 'school' , column : 'email'}),
      contact_number : vine.number().min(10),
      subscription_type : vine.enum(['FREE' , 'PREMIUM']), 
      status : vine.enum(['ACTIVE', 'INACTIVE']),
      subscription_start_date : vine.date(),
      subscription_end_date : vine.date(),
  })
)


/**
 * Validates the post's update action
 */
export const UpdateValidatorForSchools = vine.compile(
  vine.object({
    
  })
)

