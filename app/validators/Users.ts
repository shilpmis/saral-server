import { RoleType } from "#enums/user.enum";
import vine from "@vinejs/vine";

/**
 * Validator for creating a user
 */
export const CreateValidatorForUsers = vine.compile(
  vine.object({
    school_id: vine.string().uuid(), // Must be a valid UUID
    name: vine.string().trim().minLength(3).maxLength(50), // Name validation
    username: vine.string().trim().minLength(3).maxLength(30), // Username validation
    saral_email: vine.string().email(), // Must be a valid email
    password: vine.string().trim().minLength(8).maxLength(30), // Password validation
    role: vine.enum([RoleType.ADMIN, RoleType.IT_ADMIN, RoleType.PRINCIPAL, RoleType.HEAD_TEACHER, RoleType.CLERK]),  })
);

/**
 * Validator for updating a user
 */
export const UpdateValidatorForUsers = vine.compile(
  vine.object({
    // school_id: vine.string().uuid().optional(), // Optional, valid UUID
    name: vine.string().trim().minLength(3).maxLength(50).optional(), // Optional name
    username: vine.string().trim().minLength(3).maxLength(30).optional(), // Optional username
    password: vine.string().trim().minLength(8).maxLength(30).optional(), // Optional password
    role: vine.enum([RoleType.ADMIN, RoleType.IT_ADMIN, RoleType.PRINCIPAL, RoleType.HEAD_TEACHER, RoleType.CLERK])
    // last_login: vine.date().optional(), // Optional last login date
    // saral_email: vine.string().email().optional(), // Optional valid email
  })
);

