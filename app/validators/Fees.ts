import InstallmentBreakDowns from "#models/InstallmentBreakDowns";
import vine from "@vinejs/vine";

/**
 * Validates the post's creation action
 */
export const CreateValidatorForFeesType = vine.compile(
  vine.object({
    // add here
    name: vine.string().trim().minLength(2).maxLength(50),
    description: vine.string().trim().minLength(2).maxLength(50),

  })
)


/**
 * Validates the post's update action
 */
export const UpdateValidatorForFeesType = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(2).maxLength(50).optional(),
    description: vine.string().trim().minLength(2).maxLength(50).optional(),
    status: vine.enum(['Active', 'Inactive']).optional()
  })

)

export const CreateValidatorForFeesPlan = vine.compile(
  vine.object({
    fees_plan: vine.object({
      name: vine.string().trim().minLength(2).maxLength(50).optional(),
      description: vine.string().trim().minLength(2).maxLength(50).optional(),
      class_id: vine.number(),
    }),
    plan_details: vine.array(vine.object({
      // fee_plan_id: vine.number(),
      fees_type_id: vine.number(),
      installment_type: vine.enum(['Admission', 'Monthly', 'Quarterly', 'Half Yearly', 'Yearly']),
      total_installment: vine.number(),
      total_amount: vine.number().max(100000).min(100),
      installment_breakDowns: vine.array(vine.object({
        // fee_plan_details_id: vine.number(),
        installment_no: vine.number(),
        /**
         * TODOD : NEED TO ADD PEROPE VALIDATION
         */
        installment_amount: vine.number(),
        due_date: vine.date()
        // totoal_installment: vine.number(),
      })).minLength(1)
    })).minLength(1),
  })
)

export const UpdateValidatorForFeesPlan = vine.compile(
  vine.object({
    // fees_plan: vine.object({
    //   name: vine.string().trim().minLength(2).maxLength(50).optional().optional(),
    //   description: vine.string().trim().minLength(2).maxLength(50).optional(),
    // }),

  })
)

export const CreateValidatorForInstallmentBreakDown = vine.compile(
  vine.object({
    fee_plan_details_id: vine.number(),
    installment_no: vine.number(),
    /**
     * TODOD : NEED TO ADD PEROPE VALIDATION
     */
    installment_amount: vine.number(),
    totoal_installment: vine.number(),
    due_date: vine.date()
  })
)

export const CreateValidatorForconcessions = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(2).maxLength(50),
    description: vine.string().trim().minLength(2).maxLength(50),
    applicable_to: vine.enum(['fees_types', 'plan']),
  })
)

export const CreateValidationForPayFees = vine.compile(
  vine.object({
    // student_fees_master_id: vine.number(),
    installment_id: vine.number(),
    // fees_plan_details_id: vine.number(),
    paid_amount: vine.string(),
    payment_mode: vine.enum(['Cash', 'Online', 'Bank Transfer']),
    transaction_reference: vine.string().nullable(),
    payment_date: vine.date(),
    remarks: vine.string().nullable(),
    status: vine.enum(['Pending', 'Partially Paid', 'Paid', 'Overdue', 'Failed'])
  })
)

export const CreateValidationForMultipleInstallments = vine.compile(
  vine.array(vine.object({
    installment_id: vine.number(),
    // fees_plan_details_id: vine.number(),
    paid_amount: vine.string(),
    payment_mode: vine.enum(['Cash', 'Online', 'Bank Transfer']),
    transaction_reference: vine.string().nullable(),
    payment_date: vine.date(),
    remarks: vine.string().nullable(),
    status: vine.enum(['Pending', 'Partially Paid', 'Paid', 'Overdue', 'Failed'])
  })).minLength(1)
)

export const UpdateValidationForInstallment = vine.compile(
  vine.object({
    status: vine.enum(['Pending', 'Partially Paid', 'Paid', 'Overdue', 'Failed']).optional(),
    remarks: vine.string().optional()
  })
)