// import type { HttpContext } from '@adonisjs/core/http'


// import { DateTime } from 'luxon'
// // import type { HttpContext } from '@ioc:Adonis/Core/HttpContext'
// // import LeaveApplication from 'App/Models/LeaveApplication'
// // import LeavePolicy from 'App/Models/LeavePolicy'
// // import LeaveBalance from 'App/Models/LeaveBalance'
// // import LeaveType from 'App/Models/LeaveType'

// export default class LeaveController {
//   /**
//    * Teacher & Staff APIs
//    */
  
//   // Apply for leave
//   public async applyLeave({ request, auth, response }: HttpContext) {
//     try {
//       const user = auth.user!
//       const data = request.only([
//         'leave_type_id',
//         'from_date',
//         'to_date',
//         'reason',
//         'is_half_day',
//         'documents'
//       ])

//       // Validate leave policy exists for user's role
//       const policy = await LeavePolicy.query()
//         .where('role_id', user.role_id)
//         .where('leave_type_id', data.leave_type_id)
//         .where('is_active', true)
//         .first()

//       if (!policy) {
//         return response.badRequest({ message: 'No leave policy found for this leave type' })
//       }

//       // Calculate number of days
//       const fromDate = DateTime.fromISO(data.from_date)
//       const toDate = DateTime.fromISO(data.to_date)
//       const days = data.is_half_day ? 0.5 : toDate.diff(fromDate, 'days').days + 1

//       // Check leave balance
//       const balance = await LeaveBalance.query()
//         .where('staff_id', user.id)
//         .where('leave_type_id', data.leave_type_id)
//         .where('academic_year', DateTime.now().year)
//         .first()

//       if (!balance || balance.available_leaves < days) {
//         return response.badRequest({ message: 'Insufficient leave balance' })
//       }

//       // Create leave application
//       const leaveApplication = await LeaveApplication.create({
//         ...data,
//         staff_id: user.id,
//         applied_by: user.id,
//         school_id: user.school_id,
//         days,
//         status: 'pending'
//       })

//       return response.created({ message: 'Leave application submitted successfully', data: leaveApplication })
//     } catch (error) {
//       return response.internalServerError({ message: 'Error applying for leave', error })
//     }
//   }

//   // Get my leave applications
//   public async myLeaves({ auth, request, response }: HttpContext) {
//     try {
//       const { status, from_date, to_date, page = 1, limit = 10 } = request.qs()
//       const query = LeaveApplication.query()
//         .where('staff_id', auth.user!.id)
//         .preload('leaveType')
//         .preload('approvals')

//       if (status) {
//         query.where('status', status)
//       }
//       if (from_date) {
//         query.where('from_date', '>=', from_date)
//       }
//       if (to_date) {
//         query.where('to_date', '<=', to_date)
//       }

//       const leaves = await query.paginate(page, limit)
//       return response.ok(leaves)
//     } catch (error) {
//       return response.internalServerError({ message: 'Error fetching leaves', error })
//     }
//   }

//   /**
//    * Clerk APIs
//    */

//   // Apply leave on behalf of staff
//   public async applyLeaveForStaff({ request, auth, response }: HttpContext) {
//     try {
//       const data = request.only([
//         'staff_id',
//         'leave_type_id',
//         'from_date',
//         'to_date',
//         'reason',
//         'is_half_day',
//         'documents'
//       ])

//       // Add validation for clerk role here

//       const leaveApplication = await LeaveApplication.create({
//         ...data,
//         applied_by: auth.user!.id,
//         school_id: auth.user!.school_id,
//         status: 'pending'
//       })

//       return response.created({ message: 'Leave application submitted successfully', data: leaveApplication })
//     } catch (error) {
//       return response.internalServerError({ message: 'Error applying leave for staff', error })
//     }
//   }

//   // Get all staff leaves (for clerk)
//   public async getAllStaffLeaves({ request, auth, response }: HttpContext) {
//     try {
//       const {
//         staff_id,
//         status,
//         from_date,
//         to_date,
//         page = 1,
//         limit = 10
//       } = request.qs()

//       const query = LeaveApplication.query()
//         .where('school_id', auth.user!.school_id)
//         .preload('staff')
//         .preload('leaveType')

//       if (staff_id) {
//         query.where('staff_id', staff_id)
//       }
//       if (status) {
//         query.where('status', status)
//       }
//       if (from_date) {
//         query.where('from_date', '>=', from_date)
//       }
//       if (to_date) {
//         query.where('to_date', '<=', to_date)
//       }

//       const leaves = await query.paginate(page, limit)
//       return response.ok(leaves)
//     } catch (error) {
//       return response.internalServerError({ message: 'Error fetching staff leaves', error })
//     }
//   }

//   /**
//    * Admin APIs
//    */

//   // Create leave policy
//   public async createLeavePolicy({ request, auth, response }: HttpContext) {
//     try {
//       const data = request.only([
//         'role_id',
//         'leave_type_id',
//         'annual_quota',
//         'allow_half_day',
//         'requires_approval',
//         'approval_levels'
//       ])

//       const policy = await LeavePolicy.create({
//         ...data,
//         school_id: auth.user!.school_id
//       })

//       return response.created({ message: 'Leave policy created successfully', data: policy })
//     } catch (error) {
//       return response.internalServerError({ message: 'Error creating leave policy', error })
//     }
//   }

//   // Approve/Reject leave
//   public async updateLeaveStatus({ request, auth, response, params }: HttpContext) {
//     try {
//       const { status, comments } = request.only(['status', 'comments'])
//       const leaveId = params.id

//       const leave = await LeaveApplication.findOrFail(leaveId)
//       leave.status = status
//       if (status === 'rejected') {
//         leave.rejection_reason = comments
//       }
//       await leave.save()

//       // Update leave balance if approved
//       if (status === 'approved') {
//         const balance = await LeaveBalance.query()
//           .where('staff_id', leave.staff_id)
//           .where('leave_type_id', leave.leave_type_id)
//           .first()

//         if (balance) {
//           balance.used_leaves += leave.days
//           balance.available_leaves -= leave.days
//           await balance.save()
//         }
//       }

//       return response.ok({ message: `Leave ${status} successfully`, data: leave })
//     } catch (error) {
//       return response.internalServerError({ message: 'Error updating leave status', error })
//     }
//   }

//   // Get leave statistics
//   public async getLeaveStatistics({ auth, response }: HttpContext) {
//     try {
//       const stats = await LeaveApplication.query()
//         .where('school_id', auth.user!.school_id)
//         .count('* as total')
//         .count('* as pending').where('status', 'pending')
//         .count('* as approved').where('status', 'approved')
//         .count('* as rejected').where('status', 'rejected')
//         .first()

//       return response.ok(stats)
//     } catch (error) {
//       return response.internalServerError({ message: 'Error fetching leave statistics', error })
//     }
//   }

//   // Delete leave application (soft delete)
//   public async deleteLeave({ params, response }: HttpContext) {
//     try {
//       const leave = await LeaveApplication.findOrFail(params.id)
//       await leave.delete()

//       return response.ok({ message: 'Leave application deleted successfully' })
//     } catch (error) {
//       return response.internalServerError({ message: 'Error deleting leave application', error })
//     }
//   }
// }
