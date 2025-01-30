import vine from "@vinejs/vine";

/**
 * Validates the post's creation action
 */
export const CreateValidatorForClasses = vine.compile(
  vine.object({
      // add here
      class : vine.enum([1, 2 ,3 , 4 ,5 , 6, 7, 8 , 9 , 10 ,11 ,12]),
      division : vine.enum(['A' , 'B' , 'C' , 'D' , 'E' , 'F' , 'G' , 'H' , 'I' , 'J' ]),  
      
      aliases : vine.string().minLength(3).maxLength(10).optional(),
  })
)


/**
 * Validates the post's update action
 */
export const UpdateValidatorForClasses = vine.compile(
  vine.object({
    aliases : vine.string().minLength(3).maxLength(10).optional(),   
  })
)

