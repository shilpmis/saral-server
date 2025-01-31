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

  /**
   * Here we are allowing to updat only these fields ,
   * 
   * is_teaching_role fields can not be modified easily , is_teaching_role field is a link for 
   * teacher table and other staff table . 
   * 
   * if it is required to modified is_teaching_role , then it is batter to create new one and assign to proper user . 
   * 
   * we will add a api for delete this role , with condition to only delete it while there is no user staff on this role.         
   */
  vine.object({
    role: vine.string().trim().minLength(3).maxLength(25).optional(),
    permissions: vine.object({}).optional()
  })
)

