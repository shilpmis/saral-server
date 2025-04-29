import AcademicSession from '#models/AcademicSession'
import LeaveLog from '#models/LeaveLog'
import LeavePolicies from '#models/LeavePolicies'
import LeaveTypeMaster from '#models/LeaveTypeMaster'
import Staff from '#models/Staff'
import StaffLeaveApplication from '#models/StaffLeaveApplication'
import StaffLeaveBalance from '#models/StaffLeaveBalance'
import {
  CreateValidatorForLeaveApplication,
  CreateValidatorForLeavePolicies,
  CreateValidatorForLeaveType,
  UpdateValidatorForLeaveApplication,
  UpdateValidatorForLeavePolicies,
  UpdateValidatorForLeaveType,
  ValidatorForApproveApplication,
  ValidatorForCancelApplication,
  SearchValidatorForStaff,
} from '#validators/Leave'
import { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import { DateTime } from 'luxon'
import { v4 as uuidv4 } from 'uuid'

export default class LeavesController {
  async indexLeaveTypesForSchool(ctx: HttpContext) {
    try {
      let school_id = ctx.auth.user!.school_id
      let academic_session_id = ctx.request.input('academic_session_id')
      const page = ctx.request.input('page')

      // Only validate academic session if ID is provided
      if (academic_session_id) {
        let academic_session = await AcademicSession.query()
          .where('is_active', true)
          .andWhere('id', academic_session_id)
          .andWhere('school_id', school_id)
          .first()

        if (!academic_session) {
          return ctx.response.status(404).json({
            message: 'No active academic session found for your school!',
          })
        }
      }

      // Return all results without pagination if specified
      if (page === 'all') {
        let leave_types = await LeaveTypeMaster.query()
          .where('school_id', school_id)
          .orderBy('id', 'desc')

        return ctx.response.status(200).json({
          message: 'Leave types fetched successfully',
          data: leave_types,
        })
      }

      // Return paginated results
      let leave_types = await LeaveTypeMaster.query()
        .where('school_id', school_id)
        .orderBy('id', 'desc')
        .paginate(ctx.request.input('page', 1), 6)

      return ctx.response.status(200).json(leave_types)
    } catch (error) {
      console.error('Error fetching leave types:', error)
      return ctx.response.status(500).json({
        message: 'Failed to fetch leave types',
        error: process.env.NODE_ENV === 'production' ? undefined : error.message,
      })
    }
  }

  async createLeaveTypeForSchool(ctx: HttpContext) {
    try {
      // Get user information
      let school_id = ctx.auth.user!.school_id
      let role_id = ctx.auth.user!.role_id

      // Authorization check
      if (role_id !== 1) {
        return ctx.response.status(401).json({
          message: 'You are not authorized to create leave type for this school',
        })
      }

      // Validate request payload
      let payload = await CreateValidatorForLeaveType.validate(ctx.request.body())
      
      // Validate academic session
      let academic_session = await AcademicSession.query()
        .where('is_active', true)
        .andWhere('school_id', school_id)
        .andWhere('id', payload.academic_session_id)
        .first()

      if (!academic_session) {
        return ctx.response.status(404).json({
          message: 'No active academic session found for your school!',
        })
      }

      // Check if leave type with same name already exists for this school and session
      const existingLeaveType = await LeaveTypeMaster.query()
        .where('leave_type_name', payload.leave_type_name)
        .andWhere('school_id', school_id)
        .andWhere('academic_session_id', payload.academic_session_id)
        .first()

      if (existingLeaveType) {
        return ctx.response.status(409).json({
          message: 'A leave type with this name already exists for this school and academic session',
        })
      }

      // Create new leave type
      let leave = await LeaveTypeMaster.create({ ...payload, school_id: school_id })
      return ctx.response.status(201).json({
        message: 'Leave type created successfully',
        data: leave,
      })
    } catch (error) {
      // Check for specific database unique constraint errors
      if (error.code === '23505' || error.message.includes('unique constraint')) {
        return ctx.response.status(409).json({
          message: 'A leave type with this name already exists for this school and academic session',
        })
      }
      
      // Generic error handling
      console.error('Error creating leave type:', error)
      return ctx.response.status(500).json({
        message: 'Failed to create leave type',
        error: process.env.NODE_ENV === 'production' ? undefined : error.message,
      })
    }
  }

  async updateLeaveTypeForSchool(ctx: HttpContext) {
    try {
      const leave_type_id = ctx.params.leave_type_id
      let school_id = ctx.auth.user!.school_id
      let role_id = ctx.auth.user!.role_id

      // Authorization check
      if (role_id !== 1 && school_id !== ctx.auth.user?.school_id) {
        return ctx.response.status(401).json({
          message: 'You are not authorized to update leave types for this school',
        })
      }

      // Find the leave type to update
      let leave_type = await LeaveTypeMaster.query()
        .where('id', leave_type_id)
        .andWhere('school_id', school_id)
        .first()

      if (!leave_type) {
        return ctx.response.status(404).json({
          message: 'This leave type is not available for your school',
        })
      }

      // Validate academic session
      let academic_session = await AcademicSession.query()
        .where('is_active', true)
        .andWhere('school_id', school_id)
        .first()

      if (!academic_session) {
        return ctx.response.status(404).json({
          message: 'No active academic session found for your school!',
        })
      }

      if (academic_session.id != leave_type.academic_session_id) {
        return ctx.response.status(404).json({
          message: 'Active academic session is not same as leave type academic session!',
        })
      }

      // Validate request payload
      let payload = await UpdateValidatorForLeaveType.validate(ctx.request.body())

      // If trying to update name, check if it would create a duplicate
      if (payload.leave_type_name && payload.leave_type_name !== leave_type.leave_type_name) {
        const existingLeaveType = await LeaveTypeMaster.query()
          .where('leave_type_name', payload.leave_type_name)
          .andWhere('school_id', school_id)
          .andWhere('academic_session_id', leave_type.academic_session_id)
          .whereNot('id', leave_type_id)
          .first()

        if (existingLeaveType) {
          return ctx.response.status(409).json({
            message: 'A leave type with this name already exists for this school and academic session',
          })
        }
      }

      // Update leave type
      await leave_type.merge(payload).save()

      return ctx.response.status(200).json({
        message: 'Leave type updated successfully',
        data: leave_type,
      })
    } catch (error) {
      // Check for specific database unique constraint errors
      if (error.code === '23505' || error.message.includes('unique constraint')) {
        return ctx.response.status(409).json({
          message: 'A leave type with this name already exists for this school and academic session',
        })
      }

      // Generic error handling
      console.error('Error updating leave type:', error)
      return ctx.response.status(500).json({
        message: 'Failed to update leave type',
        error: process.env.NODE_ENV === 'production' ? undefined : error.message,
      })
    }
  }

  async indexLeavePolicyForSchool(ctx: HttpContext) {
    let leave_policies = await LeavePolicies.query()
      .preload('staff_role')
      .preload('leave_type')
      .where('school_id', ctx.auth.user!.school_id)
      .orderBy('id', 'desc')
      .paginate(ctx.request.input('page', 1), 6)

    return ctx.response.status(200).json(leave_policies)
  }

  async indexLeavePolicyForUser(ctx: HttpContext) {
    let staff_id = ctx.auth.user!.staff_id
    let academic_session_id = ctx.request.input('academic_session_id')

    if (!academic_session_id) {
      return ctx.response.status(400).json({
        message: 'Academic session ID is required',
      })
    }

    let academic_sesion = await AcademicSession.query()
      .where('is_active', true)
      .andWhere('id', academic_session_id)
      .andWhere('school_id', ctx.auth.user!.school_id)
      .first()

    if (!academic_sesion) {
      return ctx.response.status(404).json({
        message: 'No active academic session found for your school !',
      })
    }
    
    let staff = await Staff.find(staff_id)

    if (!staff) {
      return ctx.response.status(404).json({
        message: 'No staff member found. Please contact administrator to onboard you as staff.',
      })
    }

    let leave_policies = await LeavePolicies.query()
      .preload('leave_type')
      .preload('staff_role')
      .where('staff_role_id', staff.staff_role_id)
      .andWhere('school_id', ctx.auth.user!.school_id)
      .andWhere('academic_session_id', academic_session_id)
      .orderBy('id', 'desc')
    
    if (!academic_session_id) {
      return ctx.response.status(400).json({
        message: 'Academic session ID is required',
      })
    }
    const leaveBalances = await this.getStaffLeaveBalances(Number(staff_id), academic_session_id)
    
    // Combine policies with their balances
    const result = leave_policies.map(policy => {
      const balance = leaveBalances.find(b => b.leave_type_id === policy.leave_type_id) || {
        total_leaves: policy.annual_quota,
        used_leaves: 0,
        pending_leaves: 0,
        available_balance: policy.annual_quota
      }
      
      return {
        ...policy.serialize(),
        balance
      }
    })

    return ctx.response.status(200).json(result)
  }

  async createLeavePolicyForSchool(ctx: HttpContext) {
    let role_id = ctx.auth.user!.role_id

    if (role_id !== 1) {
      return ctx.response.status(401).json({
        message: 'You are not authorized to create leave type for this school',
      })
    }

    let payload = await CreateValidatorForLeavePolicies.validate(ctx.request.body())

    let academic_sesion = await AcademicSession.query()
      .where('is_active', true)
      .andWhere('school_id', ctx.auth.user!.school_id)
      .andWhere('id', payload.academic_session_id)
      .first()

    if (!academic_sesion) {
      return ctx.response.status(404).json({
        message: 'No active academic session found for your school !',
      })
    }

    let leave_type = await LeaveTypeMaster.query()
      .where('id', payload.leave_type_id)
      .andWhere('school_id', ctx.auth.user!.school_id)
      .first()

    if (!leave_type) {
      return ctx.response.status(404).json({
        message: 'This leave type is not available for your school',
      })
    }

    let leave = await LeavePolicies.create({ ...payload, school_id: ctx.auth.user?.school_id })

    return ctx.response.status(200).json(leave)
  }

  async updateLeavePolicyForSchool(ctx: HttpContext) {
    let role_id = ctx.auth.user!.role_id

    if (role_id !== 1 && role_id !== 2 && role_id !== 3) {
      return ctx.response.status(401).json({
        message: 'You are not authorized to create leave type for this school',
      })
    }

    let leave_policy = await LeavePolicies.query().where('id', ctx.params.leave_policy_id).first()

    if (!leave_policy) {
      return ctx.response.status(404).json({
        message: 'This leave policy is not available for your school',
      })
    }

    let validate_leave = await LeaveTypeMaster.query()
      .where('id', leave_policy!.leave_type_id)
      .andWhere('school_id', ctx.auth.user!.school_id)
      .first()

    if (!validate_leave) {
      return ctx.response.status(401).json({
        message: 'This leave policy is not available for your school',
      })
    }

    let academic_sesion = await AcademicSession.query()
      .where('is_active', true)
      .andWhere('id', validate_leave.academic_session_id)
      .andWhere('school_id', ctx.auth.user!.school_id)
      .first()

    if (!academic_sesion) {
      return ctx.response.status(404).json({
        message: 'No active academic session found for your school !',
      })
    }

    let payload = await UpdateValidatorForLeavePolicies.validate(ctx.request.body())

    await leave_policy.merge(payload).save()

    return ctx.response.status(200).json(leave_policy)
  }

  private async validateLeaveRequest(payload: any, leavePolicy: LeavePolicies) {
    let numberOfDays = 0

    const startDate = DateTime.fromJSDate(new Date(payload.from_date))
    const endDate = DateTime.fromJSDate(new Date(payload!.to_date))
    const today = DateTime.now().startOf('day')
    const twoMonthsFromNow = today.plus({ months: 2 })

    // 1. Date validations
    if (startDate < today) {
      throw new Error('Leave cannot be applied for past dates')
    }

    if (startDate > endDate) {
      throw new Error('Start date cannot be greater than end date')
    }

    if (endDate > twoMonthsFromNow) {
      throw new Error('Cannot apply leave for more than 2 months in advance')
    }

    if (payload.is_hourly_leave) {
      // 3 & 4 & 5. Hourly leave validations
      if (!startDate.equals(endDate)) {
        throw new Error('For hourly leave, start and end date must be same')
      }
      if (payload.is_half_day || payload.half_day_type !== 'none') {
        throw new Error('Hourly leave cannot be combined with half day')
      }
      if (!payload.total_hour) {
        throw new Error('Total hour should be there if leave is hour based .')
      }
      if (payload.total_hour > 4) {
        throw new Error('Hourly leave cannot exceed 4 hours')
      }
      numberOfDays = payload.total_hour / leavePolicy.staff_role.working_hours // Converting hours to days
    } else if (payload.is_half_day) {
      // 3 & 4. Half day validations
      if (!startDate.equals(endDate)) {
        throw new Error('For half day leave, start and end date must be same')
      }
      if (payload.half_day_type === 'none') {
        throw new Error('Half day type must be specified for half day leave')
      }
      numberOfDays = 0.5
    } else {
      // Calculate business days excluding weekends
      let current = startDate
      while (current <= endDate) {
        if (current.weekday <= 5) {
          // Monday = 1, Friday = 5
          numberOfDays++
        }
        current = current.plus({ days: 1 })
      }
    }

    // Validate against max consecutive days
    if (numberOfDays > leavePolicy.max_consecutive_days) {
      throw new Error(`Leave cannot exceed ${leavePolicy.max_consecutive_days} consecutive days`)
    }

    if (!payload.is_hourly_leave && payload.total_hour) {
      throw new Error('Total hour should be null if leave is not hour based !')
    }

    return numberOfDays
  }

  private async validateLeaveRequestForUpdate(
    existingLeave: any,
    updatedPayload: any,
    leavePolicy: LeavePolicies
  ) {
    let numberOfDays = 0

    // Merge existing and updated data
    const payload = {
      ...existingLeave,
      ...updatedPayload,
    }

    const startDate = DateTime.fromJSDate(new Date(payload.from_date))
    const endDate = DateTime.fromJSDate(new Date(payload.to_date))
    const today = DateTime.now().startOf('day')
    const twoMonthsFromNow = today.plus({ months: 2 })

    // Only validate dates if they are being updated
    if (updatedPayload.from_date || updatedPayload.to_date) {
      // Allow editing past leaves that were already approved
      if (existingLeave.status !== 'approved') {
        if (startDate < today) {
          throw new Error('Leave cannot be modified for past dates')
        }
      }

      if (startDate > endDate) {
        throw new Error('Start date cannot be greater than end date')
      }

      if (endDate > twoMonthsFromNow) {
        throw new Error('Cannot apply leave for more than 2 months in advance')
      }
    }

    if (payload.is_hourly_leave) {
      // Hourly leave validations
      if (!startDate.equals(endDate)) {
        throw new Error('For hourly leave, start and end date must be same')
      }
      if (payload.is_half_day || payload.half_day_type !== 'none') {
        throw new Error('Hourly leave cannot be combined with half day')
      }
      if (!payload.total_hour) {
        throw new Error('Total hour should be there if leave is hour based')
      }
      if (payload.total_hour > 4) {
        throw new Error('Hourly leave cannot exceed 4 hours')
      }
      numberOfDays = payload.total_hour / leavePolicy.staff_role.working_hours
    } else if (payload.is_half_day) {
      // Half day validations
      if (!startDate.equals(endDate)) {
        throw new Error('For half day leave, start and end date must be same')
      }
      if (payload.half_day_type === 'none') {
        throw new Error('Half day type must be specified for half day leave')
      }
      numberOfDays = 0.5
    } else {
      // Calculate business days excluding weekends
      let current = startDate
      while (current <= endDate) {
        if (current.weekday <= 5) {
          numberOfDays++
        }
        current = current.plus({ days: 1 })
      }
    }

    // Validate against max consecutive days
    if (numberOfDays > leavePolicy.max_consecutive_days) {
      throw new Error(`Leave cannot exceed ${leavePolicy.max_consecutive_days} consecutive days`)
    }

    if (!payload.is_hourly_leave && payload.total_hour) {
      throw new Error('Total hour should be null if leave is not hour based!')
    }

    // Additional update specific validations
    if (existingLeave.status === 'approved' || existingLeave.status === 'rejected') {
      throw new Error('Cannot modify an approved or rejected leave application')
    }

    return numberOfDays
  }

  async applyForLeave(ctx: HttpContext) {
    let numberOfDays: any = 0
    try {
      let payload = await CreateValidatorForLeaveApplication.validate(ctx.request.body())

      let academic_sesion = await AcademicSession.query()
        .where('is_active', true)
        .andWhere('school_id', ctx.auth.user!.school_id)
        .andWhere('id', payload.academic_session_id)
        .first()

      if (!academic_sesion) {
        return ctx.response.status(404).json({
          message: 'No active academic session found for your school !',
        })
      }

      // Check if applying for self or on behalf of another staff member
      let targetStaffId = payload.staff_id
      const userRole = ctx.auth.user!.role_id
      const userStaffId = ctx.auth.user!.staff_id
      
      // Check if user has permission to apply leave for others
      if (targetStaffId !== userStaffId) {
        // Only head clerk (role_id 3) can apply for other clerks
        const headClerk = await Staff.query()
          .where('id', userStaffId ?? 0) // Replace 0 with an appropriate fallback value if needed
          .andWhere('staff_role_id', userRole) // Assuming 3 is the head clerk role
          .first()

        if (!headClerk) {
          return ctx.response.status(403).json({
            message: 'You are not authorized to apply leave for other staff members',
          })
        }

        // Check if target staff is a clerk
        const targetStaff = await Staff.query()
          .where('id', targetStaffId)
          .andWhere('staff_role_id', 4) // Assuming 4 is the clerk role
          .andWhere('school_id', ctx.auth.user!.school_id)
          .first()

        if (!targetStaff) {
          return ctx.response.status(403).json({
            message: 'You can only apply leave on behalf of clerks',
          })
        }
      }

      let staff = await Staff.query()
        .where('id', targetStaffId)
        .andWhere('school_id', ctx.auth.user!.school_id)
        .first()

      if (!staff) {
        return ctx.response.status(404).json({
          message: 'Staff member not found or not onboarded. Please contact administration.',
        })
      }

      let leave_type = await LeaveTypeMaster.query()
        .where('id', payload.leave_type_id)
        .andWhere('school_id', ctx.auth.user!.school_id)
        .first()

      if (!leave_type) {
        return ctx.response.status(404).json({
          message: 'This leave type is not available for your school',
        })
      }

      // Get leave policy
      const leavePolicy = await LeavePolicies.query()
        .preload('staff_role')
        .where('staff_role_id', staff.staff_role_id)
        .andWhere('leave_type_id', payload.leave_type_id)
        .andWhere('academic_session_id', payload.academic_session_id)
        .first()

      if (!leavePolicy) {
        return ctx.response.status(404).json({
          message: 'No leave policy found for this leave type',
        })
      }

      try {
        numberOfDays = await this.validateLeaveRequest(payload, leavePolicy)
      } catch (error) {
        return ctx.response.status(400).json({
          message: error.message,
        })
      }

      // Check leave balance
      const leaveBalance = await StaffLeaveBalance.query()
        .where('staff_id', targetStaffId)
        .andWhere('leave_type_id', payload.leave_type_id)
        .andWhere('academic_session_id', payload.academic_session_id)
        .first()

      let availableBalance = leavePolicy.annual_quota
      
      if (leaveBalance) {
        availableBalance = leaveBalance.available_balance
      } else {
        // Create initial leave balance if it doesn't exist
        // Extract year from current date or academic session
        const currentYear = new Date().getFullYear()
        
        await StaffLeaveBalance.create({
          staff_id: targetStaffId,
          leave_type_id: payload.leave_type_id,
          academic_session_id: payload.academic_session_id,
          academic_year: currentYear,  // Add the academic year field
          total_leaves: leavePolicy.annual_quota,
          used_leaves: 0,
          pending_leaves: 0,
          carried_forward: 0,
          available_balance: leavePolicy.annual_quota,
        })
      }

      // Validate if enough balance is available
      if (numberOfDays > availableBalance) {
        return ctx.response.status(400).json({
          message: `Leave request exceeds available balance. Available: ${availableBalance} days, Requested: ${numberOfDays} days`,
        })
      }

      const trx = await db.transaction()
      try {
        const applicationId = uuidv4()
        let applied_by = ctx.auth.user?.id

        let application = await StaffLeaveApplication.create(
          {
            ...payload,
            uuid: applicationId,
            status: 'pending',
            number_of_days: numberOfDays || 0,
            applied_by_self: targetStaffId === userStaffId,
            applied_by: applied_by,
          },
          { client: trx }
        )

        // Update leave balance
        if (leaveBalance) {
          await leaveBalance.merge({
            pending_leaves: leaveBalance.pending_leaves + numberOfDays,
            available_balance: leaveBalance.available_balance - numberOfDays,
          }).save()
        }

        // Log the action
        await LeaveLog.create({
          leave_application_id: application.id,
          action: 'apply',
          status: 'pending',
          performed_by: ctx.auth.user?.id,
          remarks: `Leave applied for ${numberOfDays} days`,
        }, { client: trx })

        await trx.commit()

        return ctx.response.status(201).json(application)
      } catch (error) {
        await trx.rollback()
        return ctx.response.status(500).json({
          message: error.message,
        })
      }
    } catch (error) {
      return ctx.response.status(400).json(error)
    }
  }

  async updateAppliedLeave(ctx: HttpContext) {
    let leave_application_id = ctx.params.uuid

    let numberOfDays: any = 0

    let applcation = await StaffLeaveApplication.query()
      .preload('leave_type')
      .where('uuid', leave_application_id)
      .first()

    if (!applcation) {
      return ctx.response.status(404).json({
        message: 'Leave application you are requesting is not available',
      })
    }

    let academic_sesion = await AcademicSession.query()
      .where('is_active', true)
      .andWhere('id', applcation.academic_session_id)
      .andWhere('school_id', ctx.auth.user!.school_id)
      .first()

    if (!academic_sesion) {
      return ctx.response.status(404).json({
        message: 'No active academic session found for your school !',
      })
    }

    let payload = await UpdateValidatorForLeaveApplication.validate(ctx.request.body())

    // Teacher for staff id

    let staff = await Staff.query()
      .where('id', applcation.staff_id)
      .andWhere('school_id', ctx.auth.user!.school_id)
      .first()

    let leave_policy: LeavePolicies | null = null

    if (payload.leave_type_id) {
      leave_policy = await LeavePolicies.query()
        .where('staff_role_id', staff!.staff_role_id)
        .andWhere('leave_type_id', payload.leave_type_id)
        .andWhere('academic_session_id', academic_sesion.id)
        .first()
    } else {
      leave_policy = await LeavePolicies.query()
        .where('staff_role_id', staff!.staff_role_id)
        .andWhere('leave_type_id', applcation.leave_type_id)
        .andWhere('academic_session_id', academic_sesion.id)
        .first()
    }

    if (!leave_policy) {
      return ctx.response.status(404).json({
        message: 'This leave type or policy is been available for your school',
      })
    }
    try {
      numberOfDays = await this.validateLeaveRequestForUpdate(
        applcation.serialize(),
        payload,
        leave_policy
      )
    } catch (error) {
      return ctx.response.status(404).json({
        message: error.message,
      })
    }
    await applcation.merge({ ...payload, number_of_days: numberOfDays }).save()

    return ctx.response.status(201).json(applcation)
  }

  async fetchLeaveApplication(ctx: HttpContext) {
    let staff_id = ctx.params.staff_id
    let status = ctx.request.input('status', 'pending')
    let academic_session_id = ctx.request.input('academic_session_id')

    let academic_sesion = await AcademicSession.query()
      .where('is_active', true)
      .andWhere('id', academic_session_id)
      .andWhere('school_id', ctx.auth.user!.school_id)
      .first()

    if (!academic_sesion) {
      return ctx.response.status(404).json({
        message: 'No active academic session found for your school !',
      })
    }

    const today = new Date().toISOString().split('T')[0]

    let staff = await Staff.query()
      .where('id', staff_id)
      .andWhere('school_id', ctx.auth.user!.school_id)
      .first()

    if (staff) {
      let applications = await StaffLeaveApplication.query()
        .select([

          'staff_leave_applications.*',
          'staff.id as staff_id',
          'staff.first_name as staff_first_name',
          'staff.middle_name as staff_middle_name',
          'staff.last_name as staff_last_name',
          'staff.staff_role_id as staff_role_id',
          'sm.role as staff_role',
        ])
        // .preload('staff', (query) => {
        //   query.select('id', 'first_name', 'middle_name', 'last_name', 'staff_role_id')
        // })
        .preload('leave_type')
        .join('staff', 'staff_leave_applications.staff_id', 'staff.id')
        .join('staff_role_master as sm', 'staff.staff_role_id', 'sm.id')
        .where('staff_leave_applications.academic_session_id', academic_sesion.id)
        .andWhereRaw('DATE(staff_leave_applications.from_date) >= ?', [today])
        .andWhere('staff_leave_applications.status', status)
        .andWhere('sm.is_teaching_role', true)
        .andWhere('staff.is_active', true)
        .andWhere('staff.id', staff_id)
        .andWhere('staff.school_id', ctx.auth.user!.school_id)
        .paginate(ctx.request.input('page'), 6)

      return ctx.response.status(201).json(applications)
    } else {
      return ctx.response.status(404).json({
        message: 'This teacher is not available for your school',
      })
    }
  }

  async fetchLeaveApplicationForAdmin(ctx: HttpContext) {
    const staff_type = ctx.request.input('role')
    const status = ctx.request.input('status', 'pending')
    const date = ctx.request.input('date', null)
    const page = ctx.request.input('page', 1)
    const today = new Date().toISOString().split('T')[0]
    const search_term = ctx.request.input('search', '')

    let academic_session_id = ctx.request.input('academic_session_id')

    let academic_sesion = await AcademicSession.query()
      .where('is_active', true)
      .andWhere('id', academic_session_id)
      .andWhere('school_id', ctx.auth.user!.school_id)
      .first()

    if (!academic_sesion) {
      return ctx.response.status(404).json({
        message: 'No active academic session found for your school !',
      })
    }

    // Build the query
    let query = StaffLeaveApplication.query()
      .select([
        'staff_leave_applications.*',
        'staff.id as staff_id',
        'staff.first_name as staff_first_name',
        'staff.middle_name as staff_middle_name',
        'staff.last_name as staff_last_name',
        'staff.email as staff_email',
        'staff.mobile_number as staff_mobile',
        'staff.staff_role_id as staff_role_id',
        'sm.role as staff_role',
        'sm.is_teaching_role as is_teaching_role'
      ])
      .preload('leave_type')
      .join('staff', 'staff_leave_applications.staff_id', 'staff.id')
      .join('staff_role_master as sm', 'staff.staff_role_id', 'sm.id')
      .andWhere('staff_leave_applications.academic_session_id', academic_sesion.id)
      .andWhere('staff.is_active', true)
      .andWhere('staff.school_id', ctx.auth.user!.school_id)

    // Apply date filter
    if (date) {
      query.andWhereRaw('DATE(staff_leave_applications.from_date) >= ?', [date])
    } else {
      query.andWhereRaw('DATE(staff_leave_applications.from_date) >= ?', [today])
    }

    // Apply status filter
    if (status) {
      query.andWhere('staff_leave_applications.status', status)
    }

    // Apply staff type filter
    if (staff_type === 'teaching') {
      query.andWhere('sm.is_teaching_role', true)
    } else if (staff_type === 'non_teaching') {
      query.andWhere('sm.is_teaching_role', false)
    }

    // Apply search term if provided
    if (search_term) {
      const searchTerm = `%${search_term}%`
      query.andWhere(sq => {
        sq.whereILike('staff.first_name', searchTerm)
          .orWhereILike('staff.last_name', searchTerm)
          .orWhereILike('staff.email', searchTerm)
          .orWhere('staff.mobile_number', 'like', searchTerm)
      })
    }

    // Execute query with pagination
    const applicationQuery = await query.paginate(page, 6)

    if (applicationQuery.total === 0) {
      return ctx.response.status(200).json({
        message: 'No data found',
        data: applicationQuery
      })
    }

    return ctx.response.status(200).json(applicationQuery)
  }

  async approveTeachersLeaveApplication(ctx: HttpContext) {
    const leave_application_id = ctx.params.uuid

    let academic_Session = await AcademicSession.query()
      .where('is_active', true)
      .andWhere('school_id', ctx.auth.user!.school_id)
      .first()

    if (!academic_Session) {
      return ctx.response.status(404).json({
        message: 'No active academic session found for your school !',
      })
    }

    const leave_application = await StaffLeaveApplication.query()
      .where('uuid', leave_application_id)
      .andWhere('academic_session_id', academic_Session!.id)
      .first()

    if (!leave_application) {
      return ctx.response.status(404).json({
        message: 'Leave application you are requesting is not available',
      })
    }

    let staff = await Staff.query()
      .where('id', leave_application.staff_id)
      .andWhere('school_id', ctx.auth.user!.school_id)
      .first()

    if (!staff) {
      return ctx.response.status(404).json({
        message: 'You are not authorized to perform this action.',
      })
    }

    // Check if user has permission to approve
    if (![1, 2, 3].includes(ctx.auth.user!.role_id)) { // Admin, Principal, Head roles
      return ctx.response.status(403).json({
        message: 'You are not authorized to approve leave applications',
      })
    }

    const payload = await ValidatorForApproveApplication.validate(ctx.request.body())
    
    // Remarks is required for rejections
    if (payload.status === 'rejected' && !payload.remarks) {
      return ctx.response.status(400).json({
        message: 'Remarks are mandatory when rejecting a leave application',
      })
    }

    const trx = await db.transaction()
    try {
      await leave_application.merge({
        ...payload,
        approved_by: ctx.auth.user?.id,
        approved_at: DateTime.now().toSQL(),
      }).useTransaction(trx).save()

      // Update leave balance based on approval status
      const leaveBalance = await StaffLeaveBalance.query()
        .where('staff_id', leave_application.staff_id)
        .andWhere('leave_type_id', leave_application.leave_type_id)
        .andWhere('academic_session_id', leave_application.academic_session_id)
        .first()

      if (leaveBalance) {
        if (payload.status === 'approved') {
          await leaveBalance.merge({
            pending_leaves: leaveBalance.pending_leaves - leave_application.number_of_days,
            used_leaves: leaveBalance.used_leaves + leave_application.number_of_days,
          }).save()
        } else if (payload.status === 'rejected') {
          await leaveBalance.merge({
            pending_leaves: leaveBalance.pending_leaves - leave_application.number_of_days,
            available_balance: leaveBalance.available_balance + leave_application.number_of_days,
          }).save()
        }
      }

      // Log the action
      await LeaveLog.create({
        leave_application_id: leave_application.id,
        action: payload.status === 'approved' ? 'approve' : 'reject',
        status: payload.status,
        performed_by: ctx.auth.user?.id,
        remarks: payload.remarks || `Leave ${payload.status} by admin`,
      }, { client: trx })

      await trx.commit()

      return ctx.response.status(200).json(leave_application)
    } catch (error) {
      await trx.rollback()
      return ctx.response.status(500).json({
        message: error.message,
      })
    }
  }

  async getStaffLeaveBalances(staffId: number, academicSessionId: number) {
    // Get all leave balances for the staff
    const leaveBalances = await StaffLeaveBalance.query()
      .where('staff_id', staffId)
      .andWhere('academic_session_id', academicSessionId)
    
    return leaveBalances
  }
  
  async fetchStaffLeaveBalances(ctx: HttpContext) {
    const staffId = ctx.params.staff_id
    const academicSessionId = ctx.request.input('academic_session_id')
    
    if (!academicSessionId) {
      return ctx.response.status(400).json({
        message: 'Academic session ID is required',
      })
    }
    
    // Check if the staff exists and belongs to the same school
    const staff = await Staff.query()
      .where('id', staffId)
      .andWhere('school_id', ctx.auth.user!.school_id)
      .first()
      
    if (!staff) {
      return ctx.response.status(404).json({
        message: 'Staff member not found',
      })
    }
    
    // Get leave policies for this staff role
    const leavePolicies = await LeavePolicies.query()
      .preload('leave_type')
      .where('staff_role_id', staff.staff_role_id)
      .andWhere('academic_session_id', academicSessionId)
      .andWhere('school_id', ctx.auth.user!.school_id)
    
    // Get all leave balances for the staff
    const leaveBalances = await this.getStaffLeaveBalances(staffId, academicSessionId)
    
    // Combine policies with their balances
    const result = leavePolicies.map(policy => {
      const balance = leaveBalances.find(b => b.leave_type_id === policy.leave_type_id) || {
        total_leaves: policy.annual_quota,
        used_leaves: 0,
        pending_leaves: 0,
        available_balance: policy.annual_quota
      }
      
      return {
        policy: {
          id: policy.id,
          leave_type_id: policy.leave_type_id,
          leave_type_name: policy.leave_type.leave_type_name,
          annual_quota: policy.annual_quota,
          max_consecutive_days: policy.max_consecutive_days,
          can_carry_forward: policy.can_carry_forward
        },
        balance
      }
    })
    
    return ctx.response.status(200).json(result)
  }
  
  async searchStaff(ctx: HttpContext) {
    try {
      const payload = await SearchValidatorForStaff.validate(ctx.request.all())
      
      const query = Staff.query()
        .select([
          'staff.*',
          'staff_role_master.role as role_name',
          'staff_role_master.is_teaching_role'
        ])
        .join('staff_role_master', 'staff.staff_role_id', 'staff_role_master.id')
        .where('staff.school_id', ctx.auth.user!.school_id)
      
      // Apply filters
      if (payload.staff_type === 'teaching') {
        query.andWhere('staff_role_master.is_teaching_role', true)
      } else if (payload.staff_type === 'non_teaching') {
        query.andWhere('staff_role_master.is_teaching_role', false)
      }
      
      // Apply search terms
      if (payload.search_term) {
        const searchTerm = `%${payload.search_term}%`
        query.andWhere(query => {
          query.whereILike('staff.first_name', searchTerm)
            .orWhereILike('staff.last_name', searchTerm)
            .orWhereILike('staff.email', searchTerm)
            .orWhere('staff.mobile_number', 'like', searchTerm)
        })
      }
      
      const results = await query.paginate(payload.page || 1, payload.per_page || 10)
      
      if (results.total === 0) {
        return ctx.response.status(200).json({
          message: 'No data found',
          data: results
        })
      }
      
      return ctx.response.status(200).json(results)
    } catch (error) {
      return ctx.response.status(400).json({
        message: error.message
      })
    }
  }

  // Method to carry forward leaves at the end of academic session
  async processLeaveCarryForward(ctx: HttpContext) {
    // Only admin can process leave carry-forward
    if (ctx.auth.user!.role_id !== 1) {
      return ctx.response.status(403).json({
        message: 'Only admin can process leave carry-forward',
      })
    }
    
    const oldSessionId = ctx.request.input('old_session_id')
    const newSessionId = ctx.request.input('new_session_id')
    
    if (!oldSessionId || !newSessionId) {
      return ctx.response.status(400).json({
        message: 'Both old and new session IDs are required',
      })
    }
    
    // Verify both sessions exist and belong to the school
    const oldSession = await AcademicSession.query()
      .where('id', oldSessionId)
      .andWhere('school_id', ctx.auth.user!.school_id)
      .first()
      
    const newSession = await AcademicSession.query()
      .where('id', newSessionId)
      .andWhere('school_id', ctx.auth.user!.school_id)
      .first()
      
    if (!oldSession || !newSession) {
      return ctx.response.status(404).json({
        message: 'One or both academic sessions not found',
      })
    }
    
    // Get all leave balances from old session
    const oldBalances = await StaffLeaveBalance.query()
      .where('academic_session_id', oldSessionId)
      
    // Get all leave policies for new session
    const newPolicies = await LeavePolicies.query()
      .where('academic_session_id', newSessionId)
      .andWhere('can_carry_forward', true)
      
    const trx = await db.transaction()
    try {
      // Process each staff's leave balance
      for (const oldBalance of oldBalances) {
        // Find matching policy for this leave type
        const policy = newPolicies.find(
          p => p.leave_type_id === oldBalance.leave_type_id && 
               p.can_carry_forward === true
        )
        
        if (policy) {
          // Calculate carry-forward amount (respecting max_carry_forward_days)
          const carryAmount = Math.min(
            oldBalance.available_balance,
            policy.max_carry_forward_days
          )
          
          if (carryAmount > 0) {
            // Check if balance record already exists for new session
            const existingBalance = await StaffLeaveBalance.query()
              .where('staff_id', oldBalance.staff_id)
              .andWhere('leave_type_id', oldBalance.leave_type_id)
              .andWhere('academic_session_id', newSessionId)
              .first()
              
            if (existingBalance) {
              // Update existing balance
              await existingBalance.merge({
                carried_forward: carryAmount,
                total_leaves: policy.annual_quota + carryAmount,
                available_balance: existingBalance.available_balance + carryAmount
              }).save()
            } else {
              // Get the new academic year from the new session
              const newYear = parseInt(newSession.end_year)
              
              // Create new balance
              await StaffLeaveBalance.create({
                staff_id: oldBalance.staff_id,
                leave_type_id: oldBalance.leave_type_id,
                academic_session_id: newSessionId,
                academic_year: newYear,  // Add academic year
                total_leaves: policy.annual_quota + carryAmount,
                carried_forward: carryAmount,
                used_leaves: 0,
                pending_leaves: 0,
                available_balance: policy.annual_quota + carryAmount
              }, { client: trx })
            }
          }
        }
      }
      
      await trx.commit()
      
      return ctx.response.status(200).json({
        message: 'Leave carry-forward processed successfully',
      })
    } catch (error) {
      await trx.rollback()
      return ctx.response.status(500).json({
        message: error.message,
      })
    }
  }

  async getLeaveApplicationLogs(ctx: HttpContext) {
    const leave_application_id = ctx.params.id
    
    // Check if application exists and user has access
    const application = await StaffLeaveApplication.query()
      .where('id', leave_application_id)
      .first()
      
    if (!application) {
      return ctx.response.status(404).json({
        message: 'Leave application not found',
      })
    }
    
    // Check if user has permission to view logs
    const isOwner = ctx.auth.user!.staff_id === application.staff_id
    const isAdmin = [1, 2, 3].includes(ctx.auth.user!.role_id)
    
    if (!isOwner && !isAdmin) {
      return ctx.response.status(403).json({
        message: 'You are not authorized to view these logs',
      })
    }
    
    // Get logs with user details
    const logs = await LeaveLog.query()
      .select([
        'leave_logs.*',
        'users.first_name as performed_by_first_name',
        'users.last_name as performed_by_last_name',
        'users.role_id as performed_by_role'
      ])
      .join('users', 'leave_logs.performed_by', 'users.id')
      .where('leave_logs.leave_application_id', leave_application_id)
      .orderBy('leave_logs.created_at', 'desc')
      
    return ctx.response.status(200).json(logs)
  }

  async withdrawLeaveApplication(ctx: HttpContext) {
    const uuid = ctx.params.uuid
    
    // Get the leave application
    const leaveApplication = await StaffLeaveApplication.query()
      .where('uuid', uuid)
      .first()
    
    if (!leaveApplication) {
      return ctx.response.status(404).json({
        message: 'Leave application not found',
      })
    }
    
    // Check if user is authorized to withdraw this leave
    const isStaffOwner = leaveApplication.staff_id === ctx.auth.user!.staff_id
    const isAdmin = ctx.auth.user!.role_id === 1
    
    if (!isStaffOwner && !isAdmin) {
      return ctx.response.status(403).json({
        message: 'You are not authorized to withdraw this leave application',
      })
    }
    
    // Validate if leave can be withdrawn (must be in pending status)
    if (leaveApplication.status !== 'pending') {
      return ctx.response.status(400).json({
        message: 'Only pending leave applications can be withdrawn',
      })
    }
    
    const payload = await ValidatorForCancelApplication.validate(ctx.request.body())
    
    const trx = await db.transaction()
    try {
      // Update leave application status
      await leaveApplication.merge({
        status: 'cancelled',
        remarks: payload.remarks,
      }).useTransaction(trx).save()
      
      // Update leave balance
      const leaveBalance = await StaffLeaveBalance.query()
        .where('staff_id', leaveApplication.staff_id)
        .andWhere('leave_type_id', leaveApplication.leave_type_id)
        .andWhere('academic_session_id', leaveApplication.academic_session_id)
        .first()
      
      if (leaveBalance) {
        await leaveBalance.merge({
          pending_leaves: Math.max(0, leaveBalance.pending_leaves - leaveApplication.number_of_days),
          available_balance: leaveBalance.available_balance + leaveApplication.number_of_days,
        }).save()
      }
      
      // Log the action
      await LeaveLog.create({
        leave_application_id: leaveApplication.id,
        action: 'withdraw',
        status: 'cancelled',
        performed_by: ctx.auth.user?.id,
        remarks: payload.remarks || 'Leave withdrawn by staff member',
      }, { client: trx })
      
      await trx.commit()
      
      return ctx.response.status(200).json({
        message: 'Leave application withdrawn successfully',
        application: leaveApplication,
      })
    } catch (error) {
      await trx.rollback()
      return ctx.response.status(500).json({
        message: error.message,
      })
    }
  }
}
