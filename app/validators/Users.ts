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

export const CreateValidatorForTeacherAsUsers = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(3).maxLength(30),
    teacher_id: vine.number(),
    class_id: vine.number().optional(),
    is_active: vine.boolean()
  })
)

export const UpdateValidatorForTeacherAsUsers = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(3).maxLength(30).optional(),
    is_active: vine.boolean().optional(),
    class_id: vine.number().optional(),
    // teacher_id : vine.number(),
  })
)

export const UpdateValidatorForUsers = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(3).maxLength(30).optional(),
    is_active: vine.boolean().optional(),
  })
)
