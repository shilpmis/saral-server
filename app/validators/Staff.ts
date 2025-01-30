import vine from "@vinejs/vine";
import { visitNode } from "typescript";

/**
 * Validates the post's creation action
 */
export const CreateValidatorForStaff = vine.compile(
  vine.object({
    // add here
    role: vine.string().trim().minLength(3).maxLength(10),
    is_teaching_role: vine.boolean(),

    permissions: vine.object({}).optional()
  })
)


/**
 * Validates the post's update action
 */
export const UpdateValidatorForStaff = vine.compile(
  vine.object({
    role: vine.string().trim().minLength(3).maxLength(10).optional(),
    permissions: vine.object({}).optional()
  })
)

