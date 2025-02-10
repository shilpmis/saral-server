import vine from "@vinejs/vine";

/**
 * Validates the post's creation action
 */
export const CreateValidatorForClasses = vine.compile(
  vine.object({
    // add here
    class: vine.enum([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]),
    division: vine.enum(['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J']),

    aliases: vine.string().minLength(3).maxLength(10).optional(),
  })
)

export const CreateManyValidatorForClasses = vine.compile(
  vine.array(
    vine.object({
      // add here
      class: vine.enum([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]),
      division: vine.enum(['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J']),

      aliases: vine.string().trim()
      .minLength(3)
      .maxLength(10)
      .optional()
      // .use()
    }))
    .minLength(1)
    .maxLength(12)
)

/**
 * Validates the post's update action
 */
export const UpdateValidatorForClasses = vine.compile(
  vine.object({
    aliases: vine.string().minLength(3).maxLength(20).optional(),
  })
)


/**
 * Validatioin function for cross check unique alises name for each classes belong to same school
 */

// async function uniqueAliasesForPerticularSchool(params:type) {
  
// }