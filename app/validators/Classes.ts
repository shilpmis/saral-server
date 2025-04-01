import vine from '@vinejs/vine'

/**
 * Validates the post's creation action
 */
export const CreateValidatorForClasses = vine.compile(
  vine.object({
    // add here
    class: vine.enum([
      'Nursery',
      'LKG',
      'UKG',
      '1',
      '2',
      '3',
      '4',
      '5',
      '6',
      '7',
      '8',
      '9',
      '10',
      '11',
      '12',
    ]),
    academic_session_id: vine.number().positive(),
    is_active: vine.boolean().optional(),
  })
)

export const CreateValidatorForDivision = vine.compile(
  vine.object({
    // add here
    class_id: vine.number().positive(),
    division: vine.enum(['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L']),
    aliases: vine.string().minLength(3).maxLength(20).optional(),
    academic_session_id: vine.number().positive(),
    is_active: vine.boolean().optional(),
  })
)

export const CreateManyValidatorForClasses = vine.compile(
  vine
    .array(
      vine.object({
        class: vine.enum([
          'Nursery',
          'LKG',
          'UKG',
          '1',
          '2',
          '3',
          '4',
          '5',
          '6',
          '7',
          '8',
          '9',
          '10',
          '11',
          '12',
        ]),
        academic_session_id: vine.number().positive(),
        is_active: vine.boolean().optional(),
      })
    )
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
