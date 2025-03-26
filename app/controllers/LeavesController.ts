import AcademicSession from '#models/AcademicSession'
import LeavePolicies from '#models/LeavePolicies'
import LeaveTypeMaster from '#models/LeaveTypeMaster'
import Staff from '#models/Staff'
import StaffLeaveApplication from '#models/StaffLeaveApplication'
import {
  CreateValidatorForLeaveApplication,
  CreateValidatorForLeavePolicies,
  CreateValidatorForLeaveType,
  UpdateValidatorForLeaveApplication,
  UpdateValidatorForLeavePolicies,
  UpdateValidatorForLeaveType,
  ValidatorForApproveApplication,
} from '#validators/Leave'
import { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import { DateTime } from 'luxon'
import { v4 as uuidv4 } from 'uuid'

export default class LeavesController {
  async indexLeaveTypesForSchool(ctx: HttpContext) {
    let school_id = ctx.auth.user!.school_id
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

    if (ctx.request.input('page') == 'all') {
      let leave_types = await LeaveTypeMaster.query()
        .where('school_id', school_id)
        .orderBy('id', 'desc')

      return ctx.response.status(200).json(leave_types)
    }

    let leave_types = await LeaveTypeMaster.query()
      .where('school_id', school_id)
      .orderBy('id', 'desc')
      .paginate(ctx.request.input('page', 1), 6)

    return ctx.response.status(200).json(leave_types)
  }

  async createLeaveTypeForSchool(ctx: HttpContext) {
    let school_id = ctx.auth.user!.school_id
    let role_id = ctx.auth.user!.role_id

    if (role_id !== 1) {
      return ctx.response.status(401).json({
        message: 'You are not authorized to create leave type for this school',
      })
    }

    let payload = await CreateValidatorForLeaveType.validate(ctx.request.body())
    let academic_sesion = await AcademicSession.query()
      .where('is_active', true)
      .andWhere('school_id', school_id)
      .andWhere('id', payload.academic_session_id)
      .first()

    if (!academic_sesion) {
      return ctx.response.status(404).json({
        message: 'No active academic session found for your school !',
      })
    }

    let leave = await LeaveTypeMaster.create({ ...payload, school_id: school_id })
    return ctx.response.status(201).json(leave)
  }

  async updateLeaveTypeForSchool(ctx: HttpContext) {
    let school_id = ctx.auth.user!.school_id
    let role_id = ctx.auth.user!.role_id

    if (role_id !== 1 && school_id !== ctx.auth.user?.school_id) {
      return ctx.response.status(401).json({
        message: 'You are not authorized to create leave type for this school',
      })
    }

    let leave_type = await LeaveTypeMaster.query()
      .where('id', ctx.params.leave_type_id)
      .andWhere('school_id', school_id)
      .first()

    if (!leave_type) {
      return ctx.response.status(404).json({
        message: 'This leave type is not available for your school',
      })
    }

    let academic_sesion = await AcademicSession.query()
      .where('is_active', true)
      .andWhere('school_id', ctx.auth.user!.school_id)
      .first()

    if (!academic_sesion) {
      return ctx.response.status(404).json({
        message: 'No active academic session found for your school !',
      })
    }

    if (academic_sesion.id != leave_type.academic_session_id) {
      return ctx.response.status(404).json({
        message: 'Active academic session is not same as leave type academic session !',
      })
    }

    let payload = await UpdateValidatorForLeaveType.validate(ctx.request.body())
    await leave_type.merge(payload).save()

    return ctx.response.status(200).json(leave_type)
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
        message: 'No Teacher available for this type !',
      })
    }

    let leave_policies = await LeavePolicies.query()
      .preload('leave_type')
      .where('staff_role_id', staff.staff_role_id)
      .andWhere('school_id', ctx.auth.user!.school_id)
      .orderBy('id', 'desc')
    // .paginate(ctx.request.input('page', 1), 6);

    return ctx.response.status(200).json(leave_policies)
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

      /***
       * need to check leave balance for this type here !
       */

      let staff = await Staff.query()
        .where('id', payload.staff_id)
        .andWhere('school_id', ctx.auth.user!.school_id)
        .first()

      if (!staff) {
        return ctx.response.status(401).json({
          message: 'You are not authorized to create leave type for this school',
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
        .first()

      if (!leavePolicy) {
        return ctx.response.status(404).json({
          message: 'No leave policy found for this leave type',
        })
      }

      try {
        numberOfDays = await this.validateLeaveRequest(payload, leavePolicy)
      } catch (error) {
        return ctx.response.status(404).json({
          message: error.message,
        })
      }
      // Validate leave request and calculate days

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
            applied_by_self: ctx.auth.user!.is_teacher,
            applied_by: applied_by,
          },
          { client: trx }
        )

        await trx.commit()

        return ctx.response.status(201).json(application)
      } catch (error) {
        await trx.rollback()
        return ctx.response.status(500).json({
          message: error.message,
        })
      }
    } catch (error) {
      // console.log("error==>" , error);
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

    let applicationQuery: StaffLeaveApplication[] = []

    // let staff = await Staff.query().where('school_id', ctx.auth.user!.school_id)

    // if (!staff) {
    //   return ctx.response.status(404).json({
    //     message: 'No Leaves application for now !',
    //   })
    // }

    let academic_Session = await AcademicSession.query()
      .where('is_active', true)
      .andWhere('school_id', ctx.auth.user!.school_id)
      .first()

    if (!academic_Session) {
      return ctx.response.status(404).json({
        message: 'No active academic session found for your school !',
      })
    }

    applicationQuery = await StaffLeaveApplication.query()
      .select([
        'staff_leave_applications.*',
        'staff.id as staff_id',
        'staff.first_name as staff_first_name',
        'staff.middle_name as staff_middle_name',
        'staff.last_name as staff_last_name',
        'staff.staff_role_id as staff_role_id',
        'sm.role as staff_role',
      ])
      .preload('staff', (query) => {
        query.select('id', 'first_name', 'middle_name', 'last_name', 'staff_role_id')
      })
      .preload('leave_type')
      .join('staff', 'staff_leave_applications.staff_id', 'staff.id')
      .join('staff_role_master as sm', 'staff.staff_role_id', 'sm.id')
      .andWhere('staff_leave_applications.academic_session_id', academic_Session!.id)
      .andWhereRaw('DATE(staff_leave_applications.from_date) >= ?', [date ? date : today])
      .andWhere('staff_leave_applications.status', status)
      .andWhere('sm.is_teaching_role', staff_type === 'teaching')
      .andWhere('staff.is_active', true)
      .andWhere('staff.school_id', ctx.auth.user!.school_id)
      .paginate(page, 6)

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
        message: 'You are not authorized to perform this action .',
      })
    }

    const payload = await ValidatorForApproveApplication.validate(ctx.request.body())
    await leave_application.merge(payload).save()

    return ctx.response.status(201).json(leave_application)
  }
}
