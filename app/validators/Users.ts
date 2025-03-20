import vine from "@vinejs/vine";

/**
 * Validates the post's creation action
 */
export const CreateValidatorForUsers = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(3).maxLength(30),
    role_id: vine.number(),
  })
)

export const CreateValidatorForOnBoardTeacherAsUser = vine.compile(
  vine.object({
    staff_id: vine.number(),
    class_id: vine.number().optional(),
    is_active: vine.boolean()
  })
)

export const UpdateValidatorForOnBoardTeacherAsUser = vine.compile(
  vine.object({
    is_active: vine.boolean().optional(),
    class_id: vine.number().optional(),
  })
)

export const UpdateValidatorForUsers = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(3).maxLength(30).optional(),
    is_active: vine.boolean().optional(),
  })
)
