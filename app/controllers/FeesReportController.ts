// import AcademicSession from '#models/AcademicSession'
// import Classes from '#models/Classes'
// import ConcessionFeesPlanMaster from '#models/ConcessionFeesPlanMaster'
// import Concessions from '#models/Concessions'
// import ConcessionsInstallmentMasters from '#models/ConcessionsInstallmentMasters'
// import ConcessionStudentMaster from '#models/ConcessionStudentMaster'
// import Divisions from '#models/Divisions'
// import FeesPlan from '#models/FeesPlan'
// import FeesPlanDetails from '#models/FeesPlanDetails'
// import FeesType from '#models/FeesType'
// import InstallmentBreakDowns from '#models/InstallmentBreakDowns'
// import StudentEnrollments from '#models/StudentEnrollments'
// import StudentFeesInstallments from '#models/StudentFeesInstallments'
// import StudentFeesMaster from '#models/StudentFeesMaster'
// import StudentFeesPlanMaster from '#models/StudentFeesPlanMasters'
// import Students from '#models/Students'
// import type { HttpContext } from '@adonisjs/core/http'
// import db from '@adonisjs/lucid/services/db'
// import { DateTime } from 'luxon'

// export default class FeesReportController {
//   /**
//    * Validate academic session and ensure it's active
//    */
//   private async validateAcademicSession(ctx: HttpContext, academicSessionId?: number) {
//     const academicSessionIdToUse = academicSessionId || ctx.request.input('academic_session_id')
    
//     if (!academicSessionIdToUse) {
//       return {
//         isValid: false,
//         response: ctx.response.status(400).json({
//           message: 'Please provide academic_session_id',
//         })
//       }
//     }

//     const academicSession = await AcademicSession.query()
//       .where('id', academicSessionIdToUse)
//       .andWhere('school_id', ctx.auth.user!.school_id)
//       .first()

//     if (!academicSession) {
//       return {
//         isValid: false,
//         response: ctx.response.status(404).json({
//           message: 'Academic session not found',
//         })
//       }
//     }

//     return {
//       isValid: true,
//       academicSession
//     }
//   }

//   /**
//    * Format currency for consistent display
//    */
//   private formatCurrency(amount: number | string | null | undefined): string {
//     if (amount === null || amount === undefined) return '₹0.00'
//     return `₹${Number(amount).toLocaleString('en-IN', {
//       maximumFractionDigits: 2,
//       minimumFractionDigits: 2,
//     })}`
//   }

//   /**
//    * Format date for consistent display
//    */
//   private formatDate(date: string | Date | null | undefined): string {
//     if (!date) return '-'
//     return DateTime.fromISO(date.toString()).toFormat('dd MMM yyyy')
//   }

//   /**
//    * Calculate payment status based on amounts
//    */
//   private calculatePaymentStatus(totalAmount: number, paidAmount: number, discountedAmount: number): string {
//     const totalPaid = paidAmount + discountedAmount
    
//     if (totalPaid >= totalAmount) return 'Paid'
//     if (totalPaid > 0) return 'Partially Paid'
//     return 'Unpaid'
//   }

//   /**
//    * Calculate payment percentage
//    */
//   private calculatePaymentPercentage(totalAmount: number, paidAmount: number, discountedAmount: number): number {
//     if (totalAmount === 0) return 0
//     return Math.round(((paidAmount + discountedAmount) / totalAmount) * 100)
//   }

//   /**
//    * 1. STUDENT-LEVEL REPORTS
//    */

//   /**
//    * Student Fee Summary Report
//    * Total fees assigned, paid, concession applied, dues, carry forward
//    * Option to filter by academic year, student name, class, division
//    */
//   async studentFeeSummaryReport(ctx: HttpContext) {
//     const academicSessionValidation = await this.validateAcademicSession(ctx)
//     if (!academicSessionValidation.isValid) return academicSessionValidation.response

//     const academicSession = academicSessionValidation.academicSession
    
//     // Get filters
//     const studentName = ctx.request.input('student_name')
//     const classId = ctx.request.input('class_id')
//     const divisionId = ctx.request.input('division_id')
//     const page = ctx.request.input('page', 1)
//     const limit = ctx.request.input('limit', 10)

//     // Build query
//     let query = Students.query()
//       .select('id', 'first_name', 'middle_name', 'last_name', 'gr_no', 'roll_number')
//       .preload('fees_status', (query) => {
//         query.where('academic_session_id', academicSession!.id)
//         query.preload('paid_fees')
//       })
//       .preload('academic_class', (query) => {
//         query.where('academic_session_id', academicSession!.id)
//         query.preload('division', (query) => {
//           query.preload('class')
//         })
//       })
//       .where('school_id', ctx.auth.user!.school_id)

//     // Apply filters
//     if (studentName) {
//       query = query.where((builder) => {
//         builder
//           .whereILike('first_name', `%${studentName}%`)
//           .orWhereILike('middle_name', `%${studentName}%`)
//           .orWhereILike('last_name', `%${studentName}%`)
//           .orWhereILike('gr_no', `%${studentName}%`)
//       })
//     }

//     if (classId || divisionId) {
//       query = query.whereHas('academic_class', (builder) => {
//         if (divisionId) {
//           builder.where('division_id', divisionId)
//         } else if (classId) {
//           builder.whereHas('division', (builder) => {
//             builder.where('class_id', classId)
//           })
//         }
//       })
//     }

//     // Execute query with pagination
//     const students = await query.paginate(page, limit)
//     const { data, meta } = students.toJSON()

//     // Process data for report
//     const reportData = await Promise.all(data.map(async (student) => {
//       // Get fee plan for student's class
//       const feePlan = student.academic_class?.division?.class_id 
//         ? await FeesPlan.query()
//             .where('class_id', student.academic_class.division.class_id)
//             .andWhere('academic_session_id', academicSession!.id)
//             .andWhere('status', 'Active')
//             .first()
//         : null

//       const totalAmount = student.fees_status?.total_amount || (feePlan?.total_amount || 0)
//       const paidAmount = student.fees_status?.paid_amount || 0
//       const discountedAmount = student.fees_status?.discounted_amount || 0
//       const dueAmount = totalAmount - (paidAmount + discountedAmount)
      
//       // Calculate carry forward amount from installments
//       const carryForwardAmount = student.fees_status?.paid_fees?.reduce((total , fee) => {
//         return total + Number(fee.amount_paid_as_carry_forward || 0)
//       }, 0) || 0

//       return {
//         student_id: student.id,
//         student_name: `${student.first_name} ${student.middle_name || ''} ${student.last_name}`,
//         gr_no: student.gr_no,
//         roll_number: student.roll_number,
//         class: student.academic_class?.division?.class?.class || '-',
//         division: student.academic_class?.division?.division || '-',
//         total_fees: totalAmount,
//         paid_amount: paidAmount,
//         concession_applied: discountedAmount,
//         due_amount: dueAmount,
//         carry_forward: carryForwardAmount,
//         payment_status: this.calculatePaymentStatus(totalAmount, paidAmount, discountedAmount),
//         payment_percentage: this.calculatePaymentPercentage(totalAmount, paidAmount, discountedAmount)
//       }
//     }))

//     return ctx.response.json({
//       data: reportData,
//       meta,
//       academic_session: {
//         id: academicSession!.id,
//         name: academicSession!.session_name
//       }
//     })
//   }

//   /**
//    * Student Fee Payment History
//    * All payment dates, modes (cash, online, cheque), remarks
//    * Receipts & reference numbers
//    */
//   async studentFeePaymentHistory(ctx: HttpContext) {
//     const academicSessionValidation = await this.validateAcademicSession(ctx)
//     if (!academicSessionValidation.isValid) return academicSessionValidation.response

//     const academicSession = academicSessionValidation.academicSession
//     const studentId = ctx.params.student_id || ctx.request.input('student_id')
    
//     if (!studentId) {
//       return ctx.response.status(400).json({
//         message: 'Please provide student_id',
//       })
//     }

//     // Get student details
//     const student = await Students.query()
//       .select('id', 'first_name', 'middle_name', 'last_name', 'gr_no', 'roll_number')
//       .where('id', studentId)
//       .andWhere('school_id', ctx.auth.user!.school_id)
//       .preload('academic_class', (query) => {
//         query.where('academic_session_id', academicSession!.id)
//         query.preload('division', (query) => {
//           query.preload('class')
//         })
//       })
//       .first()

//     if (!student) {
//       return ctx.response.status(404).json({
//         message: 'Student not found',
//       })
//     }

//     // Get fee master record
//     const feesMaster = await StudentFeesMaster.query()
//       .where('student_id', studentId)
//       .andWhere('academic_session_id', academicSession!.id)
//       .first()

//     if (!feesMaster) {
//       return ctx.response.status(404).json({
//         message: 'No fee records found for this student',
//       })
//     }

//     // Get all payment records
//     const payments = await StudentFeesInstallments.query()
//       .where('student_fees_master_id', feesMaster.id)
//       .preload('applied_concessions', (query) => {
//         query.preload('concession')
//       })
//       .orderBy('payment_date', 'desc')

//     // Get installment details for each payment
//     const paymentHistory = await Promise.all(payments.map(async (payment) => {
//       const installment = await InstallmentBreakDowns.query()
//         .where('id', payment.installment_id)
//         .preload('fee_plan_details', (query) => {
//           query.preload('fees_type')
//         })
//         .first()

//       return {
//         payment_id: payment.id,
//         receipt_number: `REC-${payment.id.toString().padStart(6, '0')}`,
//         payment_date: this.formatDate(payment.payment_date),
//         payment_mode: payment.payment_mode,
//         amount: payment.paid_amount,
//         discount: payment.discounted_amount,
//         carry_forward: payment.amount_paid_as_carry_forward,
//         remaining: payment.remaining_amount,
//         status: payment.status,
//         transaction_reference: payment.transaction_reference || '-',
//         remarks: payment.remarks || '-',
//         installment_details: installment ? {
//           installment_id: installment.id,
//           installment_no: installment.installment_no,
//           due_date: this.formatDate(installment.due_date),
//           fee_type: installment.fee_plan_details?.fees_type?.name || 'Unknown',
//           installment_type: installment.fee_plan_details?.installment_type || 'Unknown'
//         } : null,
//         applied_concessions: payment.applied_concessions.map(concession => ({
//           concession_id: concession.concession_id,
//           concession_name: concession.concession?.name || `Concession #${concession.concession_id}`,
//           amount: concession.applied_amount
//         }))
//       }
//     }))

//     return ctx.response.json({
//       student: {
//         id: student.id,
//         name: `${student.first_name} ${student.middle_name || ''} ${student.last_name}`,
//         gr_no: student.gr_no,
//         roll_number: student.roll_number,
//         class: student.academic_class?.division?.class?.class || '-',
//         division: student.academic_class?.division?.division || '-',
//       },
//       fee_summary: {
//         total_amount: feesMaster.total_amount,
//         paid_amount: feesMaster.paid_amount,
//         discounted_amount: feesMaster.discounted_amount,
//         due_amount: feesMaster.due_amount,
//         status: feesMaster.status
//       },
//       payment_history: paymentHistory,
//       academic_session: {
//         id: academicSession!.id,
//         name: academicSession!.session_name
//       }
//     })
//   }

//   /**
//    * Student Due Report
//    * Shows only students with pending dues
//    * Dues by class, division, or type (Tuition, Transport, Hostel, etc.)
//    */
//   async studentDueReport(ctx: HttpContext) {
//     const academicSessionValidation = await this.validateAcademicSession(ctx)
//     if (!academicSessionValidation.isValid) return academicSessionValidation.response

//     const academicSession = academicSessionValidation.academicSession
    
//     // Get filters
//     const classId = ctx.request.input('class_id')
//     const divisionId = ctx.request.input('division_id')
//     const feeTypeId = ctx.request.input('fee_type_id')
//     const page = ctx.request.input('page', 1)
//     const limit = ctx.request.input('limit', 10)
//     const minDueAmount = ctx.request.input('min_due_amount', 0)

//     // Build base query for students with dues
//     let query = StudentFeesMaster.query()
//       .where('academic_session_id', academicSession!.id)
//       .where((builder) => {
//         builder.where('status', 'Partially Paid').orWhere('status', 'Pending')
//       })
//       .where('due_amount', '>=', minDueAmount)
//       .preload('student', (query) => {
//         query.select('id', 'first_name', 'middle_name', 'last_name', 'gr_no', 'roll_number')
//         query.preload('academic_class', (query) => {
//           query.where('academic_session_id', academicSession!.id)
//           query.preload('division', (query) => {
//             query.preload('class')
//           })
//         })
//       })
//       .preload('fees_plan')
//       .preload('paid_fees_details', (query) => {
//         if (feeTypeId) {
//           query.whereHas('fees_plan_details', (builder) => {
//             builder.where('fees_type_id', feeTypeId)
//           })
//         }
//       })

//     // Apply class/division filters
//     if (classId || divisionId) {
//       query = query.whereHas('student', (builder) => {
//         builder.whereHas('academic_class', (builder) => {
//           if (divisionId) {
//             builder.where('division_id', divisionId)
//           } else if (classId) {
//             builder.whereHas('division', (builder) => {
//               builder.where('class_id', classId)
//             })
//           }
//         })
//       })
//     }

//     // Execute query with pagination
//     const dueRecords = await query.paginate(page, limit)
//     const { data, meta } = dueRecords.toJSON()

//     // Process data for report
//     const reportData = await Promise.all(data.map(async (record) => {
//       // If fee type filter is applied, calculate due amount for that specific fee type
//       let specificDueAmount = record.due_amount
      
//       if (feeTypeId && record.paid_fees_details.length > 0) {
//         const feeTypeDetail = record.paid_fees_details.find(detail => 
//           detail.fees_plan_details?.fees_type_id === feeTypeId
//         )
        
//         if (feeTypeDetail) {
//           specificDueAmount = feeTypeDetail.due_amount
//         } else {
//           // If no payment record exists for this fee type, get the original amount from fee plan
//           const feeTypeInPlan = await FeesPlanDetails.query()
//             .where('fees_plan_id', record.fees_plan_id)
//             .where('fees_type_id', feeTypeId)
//             .first()
            
//           specificDueAmount = feeTypeInPlan?.total_amount || 0
//         }
//       }

//       // Get next installment due date
//       const nextInstallment = await InstallmentBreakDowns.query()
//         .whereHas('fee_plan_details', (builder) => {
//           builder.where('fees_plan_id', record.fees_plan_id)
//           if (feeTypeId) {
//             builder.where('fees_type_id', feeTypeId)
//           }
//         })
//         .whereNotExists(builder => {
//           builder
//             .from('student_fees_installments')
//             .whereRaw('student_fees_installments.installment_id = installment_break_downs.id')
//             .where('student_fees_master_id', record.id)
//         })
//         .orderBy('due_date', 'asc')
//         .first()

//       return {
//         student_id: record.student?.id,
//         student_name: record.student ? `${record.student.first_name} ${record.student.middle_name || ''} ${record.student.last_name}` : 'Unknown',
//         gr_no: record.student?.gr_no || '-',
//         roll_number: record.student?.roll_number || '-',
//         class: record.student?.academic_class?.division?.class?.class || '-',
//         division: record.student?.academic_class?.division?.division || '-',
//         fee_plan: record.fees_plan?.name || '-',
//         total_fees: record.total_amount,
//         paid_amount: record.paid_amount,
//         discounted_amount: record.discounted_amount,
//         due_amount: feeTypeId ? specificDueAmount : record.due_amount,
//         due_percentage: this.calculatePaymentPercentage(
//           record.total_amount, 
//           record.total_amount - record.due_amount, 
//           0
//         ),
//         next_due_date: nextInstallment ? this.formatDate(nextInstallment.due_date) : '-',
//         days_overdue: nextInstallment && nextInstallment.due_date < new Date() 
//           ? DateTime.fromJSDate(new Date()).diff(DateTime.fromISO(nextInstallment.due_date.toString()), 'days').days 
//           : 0
//       }
//     }))

//     // Get summary statistics
//     const totalDueAmount = reportData.reduce((sum, record) => sum + Number(record.due_amount), 0)
//     const totalStudentsWithDues = meta.total
    
//     // Get fee type name if filter is applied
//     let feeTypeName = null
//     if (feeTypeId) {
//       const feeType = await FeesType.query().where('id', feeTypeId).first()
//       feeTypeName = feeType?.name
//     }

//     return ctx.response.json({
//       data: reportData,
//       meta,
//       summary: {
//         total_due_amount: totalDueAmount,
//         total_students_with_dues: totalStudentsWithDues,
//         fee_type: feeTypeName,
//         academic_session: academicSession!.session_name
//       }
//     })
//   }

//   /**
//    * 2. FEE TYPE / PLAN BASED REPORTS
//    */

//   /**
//    * Fee Type Collection Report
//    * Fee Type-wise collection (e.g., Tuition, Lab, Transport)
//    * Includes total expected, collected, balance
//    */
//   async feeTypeCollectionReport(ctx: HttpContext) {
//     const academicSessionValidation = await this.validateAcademicSession(ctx)
//     if (!academicSessionValidation.isValid) return academicSessionValidation.response

//     const academicSession = academicSessionValidation.academicSession
    
//     // Get all fee types for this academic session
//     const feeTypes = await FeesType.query()
//       .where('academic_session_id', academicSession!.id)
//       .andWhere('school_id', ctx.auth.user!.school_id)
//       .andWhere('status', 'Active')

//     // For each fee type, calculate collection statistics
//     const reportData = await Promise.all(feeTypes.map(async (feeType) => {
//       // Get all fee plan details for this fee type
//       const feePlanDetails = await FeesPlanDetails.query()
//         .where('fees_type_id', feeType.id)
//         .whereHas('fees_plan', (builder) => {
//           builder.where('academic_session_id', academicSession!.id)
//           builder.where('status', 'Active')
//         })

//       // Calculate total expected amount across all plans
//       const totalExpectedAmount = feePlanDetails.reduce((sum, detail) => sum + Number(detail.total_amount), 0)
      
//       // Get collection data from student fees plan master
//       const collectionData = await db.from('student_fees_plan_masters')
//         .join('fees_plan_details', 'student_fees_plan_masters.fees_plan_details_id', 'fees_plan_details.id')
//         .where('fees_plan_details.fees_type_id', feeType.id)
//         .whereIn('fees_plan_details.id', feePlanDetails.map(detail => detail.id))
//         .sum('student_fees_plan_masters.paid_amount as total_collected')
//         .sum('student_fees_plan_masters.discounted_amount as total_discounted')
//         .first()

//       const totalCollected = Number(collectionData?.total_collected || 0)
//       const totalDiscounted = Number(collectionData?.total_discounted || 0)
//       const totalBalance = totalExpectedAmount - (totalCollected + totalDiscounted)
      
//       // Count students assigned to this fee type
//       const studentCount = await db.from('student_fees_plan_masters')
//         .countDistinct('student_fees_master_id as count')
//         .whereIn('fees_plan_details_id', feePlanDetails.map(detail => detail.id))
//         .first()

//       return {
//         fee_type_id: feeType.id,
//         fee_type_name: feeType.name,
//         description: feeType.description,
//         total_expected: totalExpectedAmount,
//         total_collected: totalCollected,
//         total_discounted: totalDiscounted,
//         total_balance: totalBalance,
//         collection_percentage: this.calculatePaymentPercentage(totalExpectedAmount, totalCollected, totalDiscounted),
//         student_count: studentCount?.count || 0
//       }
//     }))

//     // Calculate overall totals
//     const overallTotals = {
//       total_expected: reportData.reduce((sum, item) => sum + Number(item.total_expected), 0),
//       total_collected: reportData.reduce((sum, item) => sum + Number(item.total_collected), 0),
//       total_discounted: reportData.reduce((sum, item) => sum + Number(item.total_discounted), 0),
//       total_balance: reportData.reduce((sum, item) => sum + Number(item.total_balance), 0),
//     }

//     return ctx.response.json({
//       data: reportData,
//       summary: {
//         ...overallTotals,
//         collection_percentage: this.calculatePaymentPercentage(
//           overallTotals.total_expected, 
//           overallTotals.total_collected, 
//           overallTotals.total_discounted
//         ),
//         academic_session: academicSession!.session_name
//       }
//     })
//   }

//   /**
//    * Fee Plan Performance Report
//    * Reports how well a particular fee plan is performing
//    * Breakdown per class/division
//    */
//   async feePlanPerformanceReport(ctx: HttpContext) {
//     const academicSessionValidation = await this.validateAcademicSession(ctx)
//     if (!academicSessionValidation.isValid) return academicSessionValidation.response

//     const academicSession = academicSessionValidation.academicSession
    
//     // Get filters
//     const classId = ctx.request.input('class_id')
//     const divisionId = ctx.request.input('division_id')
//     const feePlanId = ctx.request.input('fee_plan_id')
    
//     // Build query for fee plans
//     let query = FeesPlan.query()
//       .where('academic_session_id', academicSession!.id)
//       .where('status', 'Active')
//       .preload('fees_detail', (query) => {
//         query.preload('fees_type')
//       })

//     // Apply filters
//     if (feePlanId) {
//       query = query.where('id', feePlanId)
//     }
    
//     if (classId) {
//       query = query.where('class_id', classId)
//     }
    
//     if (divisionId) {
//       query = query.where('division_id', divisionId)
//     }

//     const feePlans = await query

//     // For each fee plan, calculate performance metrics
//     const reportData = await Promise.all(feePlans.map(async (feePlan) => {
//       // Get class and division details
//       const classDetails = await Classes.query()
//         .where('id', feePlan.class_id)
//         .first()
        
//       const divisionDetails = await Divisions.query()
//         .where('id', feePlan.division_id)
//         .first()
      
//       // Get all students assigned to this fee plan
//       const studentFeesMasters = await StudentFeesMaster.query()
//         .where('fees_plan_id', feePlan.id)
//         .where('academic_session_id', academicSession!.id)
      
//       // Calculate collection statistics
//       const totalExpectedAmount = feePlan.total_amount * studentFeesMasters.length
//       const totalCollectedAmount = studentFeesMasters.reduce((sum, record) => sum + Number(record.paid_amount), 0)
//       const totalDiscountedAmount = studentFeesMasters.reduce((sum, record) => sum + Number(record.discounted_amount), 0)
//       const totalBalanceAmount = totalExpectedAmount - (totalCollectedAmount + totalDiscountedAmount)
      
//       // Count students by payment status
//       const fullyPaidCount = studentFeesMasters.filter(record => record.status === 'Paid').length
//       const partiallyPaidCount = studentFeesMasters.filter(record => record.status === 'Partially Paid').length
//       const unpaidCount = studentFeesMasters.filter(record => record.status === 'Pending').length
      
//       // Get fee type breakdown
//       const feeTypeBreakdown = await Promise.all(feePlan.fees_detail.map(async (detail) => {
//         const feeTypeCollectionData = await db.from('student_fees_plan_masters')
//           .where('fees_plan_details_id', detail.id)
//           .sum('paid_amount as collected')
//           .sum('discounted_amount as discounted')
//           .sum('due_amount as balance')
//           .first()
          
//         return {
//           fee_type_id: detail.fees_type_id,
//           fee_type_name: detail.fees_type?.name || `Fee Type #${detail.fees_type_id}`,
//           total_amount: detail.total_amount,
//           collected: feeTypeCollectionData?.collected || 0,
//           discounted: feeTypeCollectionData?.discounted || 0,
//           balance: feeTypeCollectionData?.balance || 0,
//           collection_percentage: this.calculatePaymentPercentage(
//             detail.total_amount * studentFeesMasters.length,
//             feeTypeCollectionData?.collected || 0,
//             feeTypeCollectionData?.discounted || 0
//           )
//         }
//       }))
      
//       return {
//         fee_plan_id: feePlan.id,
//         fee_plan_name: feePlan.name,
//         class: classDetails?.class || `Class #${feePlan.class_id}`,
//         division: divisionDetails?.division || `Division #${feePlan.division_id}`,
//         total_students: studentFeesMasters.length,
//         student_status: {
//           fully_paid: fullyPaidCount,
//           partially_paid: partiallyPaidCount,
//           unpaid: unpaidCount
//         },
//         financial_summary: {
//           total_expected: totalExpectedAmount,
//           total_collected: totalCollectedAmount,
//           total_discounted: totalDiscountedAmount,
//           total_balance: totalBalanceAmount,
//           collection_percentage: this.calculatePaymentPercentage(
//             totalExpectedAmount, 
//             totalCollectedAmount, 
//             totalDiscountedAmount
//           )
//         },
//         fee_type_breakdown: feeTypeBreakdown
//       }
//     }))

//     return ctx.response.json({
//       data: reportData,
//       academic_session: {
//         id: academicSession!.id,
//         name: academicSession!.session_name
//       }
//     })
//   }

//   /**
//    * 3. CONCESSION REPORTS
//    */

//   /**
//    * Concession Summary Report
//    * Total concession amount given by type (EWS, Staff Child, etc.)
//    * Number of students under each type
//    */
//   async concessionSummaryReport(ctx: HttpContext) {
//     const academicSessionValidation = await this.validateAcademicSession(ctx)
//     if (!academicSessionValidation.isValid) return academicSessionValidation.response

//     const academicSession = academicSessionValidation.academicSession
    
//     // Get all concession types for this academic session
//     const concessions = await Concessions.query()
//       .where('academic_session_id', academicSession!.id)
//       .andWhere('school_id', ctx.auth.user!.school_id)
    
//     // For each concession type, calculate summary statistics
//     const reportData = await Promise.all(concessions.map(async (concession) => {
//       // Get student concessions
//       const studentConcessions = await ConcessionStudentMaster.query()
//         .where('concession_id', concession.id)
//         .where('academic_session_id', academicSession!.id)
//         .where('status', 'Active')
      
//       // Get plan concessions
//       const planConcessions = await ConcessionFeesPlanMaster.query()
//         .where('concession_id', concession.id)
//         .where('academic_session_id', academicSession!.id)
//         .where('status', 'Active')
      
//       // Calculate total applied discount for student concessions
//       const totalStudentDiscount = studentConcessions.reduce(
//         (sum, record) => sum + Number(record.applied_discount || 0), 
//         0
//       )
      
//       // Calculate total applied discount for plan concessions
//       // This is more complex as we need to check all students under each plan
//       let totalPlanDiscount = 0
//       for (const planConcession of planConcessions) {
//         // Get all student fee masters for this plan
//         const studentFeesMasters = await StudentFeesMaster.query()
//           .where('fees_plan_id', planConcession.fees_plan_id)
//           .where('academic_session_id', academicSession!.id)
        
//         // For each student, calculate the concession amount
//         for (const feesMaster of studentFeesMasters) {
//           // Get all installments for this student
//           const installments = await StudentFeesInstallments.query()
//             .where('student_fees_master_id', feesMaster.id)
          
//           // For each installment, get concessions applied
//           for (const installment of installments) {
//             const concessionInstallments = await ConcessionsInstallmentMasters.query()
//               .where('student_fees_installment_id', installment.id)
//               .where('concession_id', concession.id)
            
//             // Sum up the applied amounts
//             totalPlanDiscount += concessionInstallments.reduce(
//               (sum, record) => sum + Number(record.applied_amount || 0),
//               0
//             )
//           }
//         }
//       }
      
//       // Count unique students benefiting from this concession
//       const studentCount = await db.from('concessions_student_masters')
//         .countDistinct('student_id as count')
//         .where('concession_id', concession.id)
//         .where('academic_session_id', academicSession!.id)
//         .where('status', 'Active')
//         .first()
      
//       // Count unique plans with this concession
//       const planCount = await db.from('concession_fees_plan_master')
//         .countDistinct('fees_plan_id as count')
//         .where('concession_id', concession.id)
//         .where('academic_session_id', academicSession!.id)
//         .where('status', 'Active')
//         .first()
      
//       return {
//         concession_id: concession.id,
//         concession_name: concession.name,
//         description: concession.description,
//         category: concession.category,
//         applicable_to: concession.applicable_to,
//         concessions_to: concession.concessions_to,
//         status: concession.status,
//         student_count: studentCount?.count || 0,
//         plan_count: planCount?.count || 0,
//         total_student_discount: totalStudentDiscount,
//         total_plan_discount: totalPlanDiscount,
//         total_discount: totalStudentDiscount + totalPlanDiscount
//       }
//     }))
    
//     // Calculate overall totals
//     const overallTotals = {
//       total_student_discount: reportData.reduce((sum, item) => sum + Number(item.total_student_discount), 0),
//       total_plan_discount: reportData.reduce((sum, item) => sum + Number(item.total_plan_discount), 0),
//       total_discount: reportData.reduce((sum, item) => sum + Number(item.total_discount), 0),
//       total_students_benefited: await db.from('concessions_student_masters')
//         .countDistinct('student_id as count')
//         .where('academic_session_id', academicSession!.id)
//         .where('status', 'Active')
//         .first()
//         .then(result => result?.count || 0),
//       total_plans_with_concessions: await db.from('concession_fees_plan_master')
//         .countDistinct('fees_plan_id as count')
//         .where('academic_session_id', academicSession!.id)
//         .where('status', 'Active')
//         .first()
//         .then(result => result?.count || 0)
//     }

//     return ctx.response.json({
//       data: reportData,
//       summary: {
//         ...overallTotals,
//         academic_session: academicSession!.session_name
//       }
//     })
//   }

//   /**
//    * Student-Wise Concession Report
//    * Applied concession per student and total benefit availed
//    */
//   async studentWiseConcessionReport(ctx: HttpContext) {
//     const academicSessionValidation = await this.validateAcademicSession(ctx)
//     if (!academicSessionValidation.isValid) return academicSessionValidation.response

//     const academicSession = academicSessionValidation.academicSession
    
//     // Get filters
//     const studentName = ctx.request.input('student_name')
//     const classId = ctx.request.input('class_id')
//     const divisionId = ctx.request.input('division_id')
//     const concessionId = ctx.request.input('concession_id')
//     const page = ctx.request.input('page', 1)
//     const limit = ctx.request.input('limit', 10)
    
//     // Build query for students with concessions
//     let query = ConcessionStudentMaster.query()
//       .where('academic_session_id', academicSession!.id)
//       .where('status', 'Active')
//       .preload('student', (query) => {
//         query.select('id', 'first_name', 'middle_name', 'last_name', 'gr_no', 'roll_number')
//         query.preload('academic_class', (query) => {
//           query.where('academic_session_id', academicSession!.id)
//           query.preload('division', (query) => {
//             query.preload('class')
//           })
//         })
        
//         if (studentName) {
//           query.where((builder) => {
//             builder
//               .whereILike('first_name', `%${studentName}%`)
//               .orWhereILike('middle_name', `%${studentName}%`)
//               .orWhereILike('last_name', `%${studentName}%`)
//               .orWhereILike('gr_no', `%${studentName}%`)
//           })
//         }
//       })
//       .preload('concession')
//       .preload('fees_type')
//       .preload('fees_plan')
    
//     // Apply filters
//     if (concessionId) {
//       query = query.where('concession_id', concessionId)
//     }
    
//     if (classId || divisionId) {
//       query = query.whereHas('student', (builder) => {
//         builder.whereHas('academic_class', (builder) => {
//           if (divisionId) {
//             builder.where('division_id', divisionId)
//           } else if (classId) {
//             builder.whereHas('division', (builder) => {
//               builder.where('class_id', classId)
//             })
//           }
//         })
//       })
//     }
    
//     // Execute query with pagination
//     const concessions = await query.paginate(page, limit)
//     const { data, meta } = concessions.toJSON()
    
//     // Process data for report
//     const reportData = data.map(concession => {
//       // Calculate potential benefit
//       let potentialBenefit = 0
//       if (concession.deduction_type === 'fixed_amount') {
//         potentialBenefit = Number(concession.amount || 0)
//       } else if (concession.deduction_type === 'percentage') {
//         // For percentage, we need the base amount
//         if (concession.fees_type_id) {
//           // For specific fee type
//           potentialBenefit = (Number(concession.percentage || 0) / 100) * 
//             (concession.fees_type?.total_amount || 0)
//         } else {
//           // For entire plan
//           potentialBenefit = (Number(concession.percentage || 0) / 100) * 
//             (concession.fees_plan?.total_amount || 0)
//         }
//       }
      
//       return {
//         student_id: concession.student?.id,
//         student_name: concession.student ? 
//           `${concession.student.first_name} ${concession.student.middle_name || ''} ${concession.student.last_name}` : 
//           'Unknown',
//         gr_no: concession.student?.gr_no || '-',
//         roll_number: concession.student?.roll_number || '-',
//         class: concession.student?.academic_class?.division?.class?.class || '-',
//         division: concession.student?.academic_class?.division?.division || '-',
//         concession_id: concession.concession_id,
//         concession_name: concession.concession?.name || `Concession #${concession.concession_id}`,
//         concession_category: concession.concession?.category || '-',
//         deduction_type: concession.deduction_type,
//         amount: concession.amount,
//         percentage: concession.percentage,
//         applied_to: concession.fees_type_id ? 
//           `Fee Type: ${concession.fees_type?.name || `#${concession.fees_type_id}`}` : 
//           'Entire Fee Plan',
//         potential_benefit: potentialBenefit,
//         actual_benefit: concession.applied_discount,
//         utilization_percentage: potentialBenefit > 0 ? 
//           Math.round((concession.applied_discount / potentialBenefit) * 100) : 
//           0
//       }
//     })
    
//     // Group by student for summary
//     const studentSummary = {}
//     reportData.forEach(record => {
//       if (!studentSummary[record.student_id]) {
//         studentSummary[record.student_id] = {
//           student_id: record.student_id,
//           student_name: record.student_name,
//           gr_no: record.gr_no,
//           roll_number: record.roll_number,
//           class: record.class,
//           division: record.division,
//           concessions: [],
//           total_benefit: 0
//         }
//       }
      
//       studentSummary[record.student_id].concessions.push({
//         concession_name: record.concession_name,
//         concession_category: record.concession_category,
//         applied_to: record.applied_to,
//         actual_benefit: record.actual_benefit
//       })
      
//       studentSummary[record.student_id].total_benefit += Number(record.actual_benefit)
//     })
    
//     return ctx.response.json({
//       data: reportData,
//       student_summary: Object.values(studentSummary),
//       meta,
//       academic_session: {
//         id: academicSession!.id,
//         name: academicSession!.session_name
//       }
//     })
//   }

//   /**
//    * 4. INSTALLMENT REPORTS
//    */

//   /**
//    * Installment-Wise Collection Report
//    * Collection status for each installment due date
//    * Pending and delayed installments
//    */
//   async installmentWiseCollectionReport(ctx: HttpContext) {
//     const academicSessionValidation = await this.validateAcademicSession(ctx)
//     if (!academicSessionValidation.isValid) return academicSessionValidation.response

//     const academicSession = academicSessionValidation.academicSession
    
//     // Get filters
//     const classId = ctx.request.input('class_id')
//     const divisionId = ctx.request.input('division_id')
//     const feeTypeId = ctx.request.input('fee_type_id')
//     const installmentType = ctx.request.input('installment_type')
//     const startDate = ctx.request.input('start_date')
//     const endDate = ctx.request.input('end_date')
    
//     // Build query for installments
//     let query = InstallmentBreakDowns.query()
//       .preload('fee_plan_details', (query) => {
//         query.preload('fees_plan', (query) => {
//           query.where('academic_session_id', academicSession!.id)
          
//           if (classId) {
//             query.where('class_id', classId)
//           }
          
//           if (divisionId) {
//             query.where('division_id', divisionId)
//           }
//         })
        
//         if (feeTypeId) {
//           query.where('fees_type_id', feeTypeId)
//         }
        
//         if (installmentType) {
//           query.where('installment_type', installmentType)
//         }
//       })
//       .whereHas('fee_plan_details', (builder) => {
//         builder.whereHas('fees_plan', (builder) => {
//           builder.where('academic_session_id', academicSession!.id)
          
//           if (classId) {
//             builder.where('class_id', classId)
//           }
          
//           if (divisionId) {
//             builder.where('division_id', divisionId)
//           }
//         })
        
//         if (feeTypeId) {
//           builder.where('fees_type_id', feeTypeId)
//         }
        
//         if (installmentType) {
//           builder.where('installment_type', installmentType)
//         }
//       })
    
//     // Apply date filters
//     if (startDate) {
//       query = query.where('due_date', '>=', startDate)
//     }
    
//     if (endDate) {
//       query = query.where('due_date', '<=', endDate)
//     }
    
//     // Order by due date
//     query = query.orderBy('due_date', 'asc')
    
//     const installments = await query
    
//     // For each installment, calculate collection statistics
//     const reportData = await Promise.all(installments.map(async (installment) => {
//       if (!installment.fee_plan_details?.fees_plan) {
//         return null // Skip if no plan details
//       }
      
//       // Get class and division details
//       const classDetails = await Classes.query()
//         .where('id', installment.fee_plan_details.fees_plan.class_id)
//         .first()
        
//       const divisionDetails = await Divisions.query()
//         .where('id', installment.fee_plan_details.fees_plan.division_id)
//         .first()
      
//       // Get fee type details
//       const feeTypeDetails = await FeesType.query()
//         .where('id', installment.fee_plan_details.fees_type_id)
//         .first()
      
//       // Get all students assigned to this fee plan
//       const studentFeesMasters = await StudentFeesMaster.query()
//         .where('fees_plan_id', installment.fee_plan_details.fees_plan.id)
//         .where('academic_session_id', academicSession!.id)
      
//       // Get payment records for this installment
//       const paymentRecords = await StudentFeesInstallments.query()
//         .whereIn('student_fees_master_id', studentFeesMasters.map(record => record.id))
//         .where('installment_id', installment.id)
      
//       // Calculate collection statistics
//       const totalStudents = studentFeesMasters.length
//       const totalExpectedAmount = installment.installment_amount * totalStudents
//       const totalCollectedAmount = paymentRecords.reduce((sum, record) => sum + Number(record.paid_amount), 0)
//       const totalDiscountedAmount = paymentRecords.reduce((sum, record) => sum + Number(record.discounted_amount), 0)
//       const totalRemainingAmount = paymentRecords.reduce((sum, record) => sum + Number(record.remaining_amount), 0)
//       const totalBalanceAmount = totalExpectedAmount - (totalCollectedAmount + totalDiscountedAmount)
      
//       // Count students by payment status
//       const paidStudentsCount = new Set(paymentRecords.map(record => record.student_fees_master_id)).size
//       const unpaidStudentsCount = totalStudents - paidStudentsCount
      
//       // Check if installment is overdue
//       const isOverdue = new Date(installment.due_date) < new Date()
//       const daysOverdue = isOverdue ? 
//         DateTime.fromJSDate(new Date()).diff(DateTime.fromISO(installment.due_date.toString()), 'days').days : 
//         0
      
//       return {
//         installment_id: installment.id,
//         installment_no: installment.installment_no,
//         due_date: this.formatDate(installment.due_date),
//         fee_plan_id: installment.fee_plan_details.fees_plan.id,
//         fee_plan_name: installment.fee_plan_details.fees_plan.name,
//         fee_type_id: installment.fee_plan_details.fees_type_id,
//         fee_type_name: feeTypeDetails?.name || `Fee Type #${installment.fee_plan_details.fees_type_id}`,
//         installment_type: installment.fee_plan_details.installment_type,
//         class: classDetails?.class || `Class #${installment.fee_plan_details.fees_plan.class_id}`,
//         division: divisionDetails?.division || `Division #${installment.fee_plan_details.fees_plan.division_id}`,
//         installment_amount: installment.installment_amount,
//         total_students: totalStudents,
//         students_paid: paidStudentsCount,
//         students_unpaid: unpaidStudentsCount,
//         total_expected: totalExpectedAmount,
//         total_collected: totalCollectedAmount,
//         total_discounted: totalDiscountedAmount,
//         total_remaining: totalRemainingAmount,
//         total_balance: totalBalanceAmount,
//         collection_percentage: this.calculatePaymentPercentage(
//           totalExpectedAmount, 
//           totalCollectedAmount, 
//           totalDiscountedAmount
//         ),
//         is_overdue: isOverdue,
//         days_overdue: daysOverdue
//       }
//     }))
    
//     // Filter out null values and group by month
//     const filteredData = reportData.filter(item => item !== null)
    
//     // Group by month for summary
//     const monthlyData = {}
//     filteredData.forEach(record => {
//       const month = DateTime.fromISO(record.due_date).toFormat('MMM yyyy')
      
//       if (!monthlyData[month]) {
//         monthlyData[month] = {
//           month,
//           total_expected: 0,
//           total_collected: 0,
//           total_discounted: 0,
//           total_balance: 0,
//           installment_count: 0
//         }
//       }
      
//       monthlyData[month].total_expected += Number(record.total_expected)
//       monthlyData[month].total_collected += Number(record.total_collected)
//       monthlyData[month].total_discounted += Number(record.total_discounted)
//       monthlyData[month].total_balance += Number(record.total_balance)
//       monthlyData[month].installment_count += 1
//     })
    
//     // Calculate overall totals
//     const overallTotals = {
//       total_expected: filteredData.reduce((sum, item) => sum + Number(item.total_expected), 0),
//       total_collected: filteredData.reduce((sum, item) => sum + Number(item.total_collected), 0),
//       total_discounted: filteredData.reduce((sum, item) => sum + Number(item.total_discounted), 0),
//       total_balance: filteredData.reduce((sum, item) => sum + Number(item.total_balance), 0),
//       total_installments: filteredData.length,
//       overdue_installments: filteredData.filter(item => item.is_overdue).length
//     }

//     return ctx.response.json({
//       data: filteredData,
//       monthly_summary: Object.values(monthlyData),
//       summary: {
//         ...overallTotals,
//         collection_percentage: this.calculatePaymentPercentage(
//           overallTotals.total_expected, 
//           overallTotals.total_collected, 
//           overallTotals.total_discounted
//         ),
//         academic_session: academicSession!.session_name
//       }
//     })
//   }

//   /**
//    * Overdue Installment Report
//    * Students who missed installment deadlines
//    */
//   async overdueInstallmentReport(ctx: HttpContext) {
//     const academicSessionValidation = await this.validateAcademicSession(ctx)
//     if (!academicSessionValidation.isValid) return academicSessionValidation.response

//     const academicSession = academicSessionValidation.academicSession
    
//     // Get filters
//     const classId = ctx.request.input('class_id')
//     const divisionId = ctx.request.input('division_id')
//     const feeTypeId = ctx.request.input('fee_type_id')
//     const minDaysOverdue = ctx.request.input('min_days_overdue', 0)
//     const page = ctx.request.input('page', 1)
//     const limit = ctx.request.input('limit', 10)
    
//     // Get current date
//     const currentDate = new Date()
    
//     // Find all overdue installments
//     let installmentsQuery = InstallmentBreakDowns.query()
//       .where('due_date', '<', currentDate)
//       .preload('fee_plan_details', (query) => {
//         query.preload('fees_plan', (query) => {
//           query.where('academic_session_id', academicSession!.id)
          
//           if (classId) {
//             query.where('class_id', classId)
//           }
          
//           if (divisionId) {
//             query.where('division_id', divisionId)
//           }
//         })
        
//         if (feeTypeId) {
//           query.where('fees_type_id', feeTypeId)
//         }
//       })
//       .whereHas('fee_plan_details', (builder) => {
//         builder.whereHas('fees_plan', (builder) => {
//           builder.where('academic_session_id', academicSession!.id)
          
//           if (classId) {
//             builder.where('class_id', classId)
//           }
          
//           if (divisionId) {
//             builder.where('division_id', divisionId)
//           }
//         })
        
//         if (feeTypeId) {
//           builder.where('fees_type_id', feeTypeId)
//         }
//       })
    
//     const overdueInstallments = await installmentsQuery
    
//     // For each overdue installment, find students who haven't paid
//     let overdueRecords = []
    
//     for (const installment of overdueInstallments) {
//       if (!installment.fee_plan_details?.fees_plan) continue
      
//       // Get all students assigned to this fee plan
//       const studentFeesMasters = await StudentFeesMaster.query()
//         .where('fees_plan_id', installment.fee_plan_details.fees_plan.id)
//         .where('academic_session_id', academicSession!.id)
//         .preload('student', (query) => {
//           query.select('id', 'first_name', 'middle_name', 'last_name', 'gr_no', 'roll_number')
//           query.preload('academic_class', (query) => {
//             query.where('academic_session_id', academicSession!.id)
//             query.preload('division', (query) => {
//               query.preload('class')
//             })
//           })
//         })
      
//       for (const feesMaster of studentFeesMasters) {
//         // Check if this installment has been paid by this student
//         const paymentRecord = await StudentFeesInstallments.query()
//           .where('student_fees_master_id', feesMaster.id)
//           .where('installment_id', installment.id)
//           .first()
        
//         // If no payment record or payment is partial, add to overdue list
//         if (!paymentRecord || Number(paymentRecord.remaining_amount) > 0) {
//           // Calculate days overdue
//           const daysOverdue = DateTime.fromJSDate(currentDate)
//             .diff(DateTime.fromISO(installment.due_date.toString()), 'days').days
          
//           // Skip if below minimum days overdue threshold
//           if (daysOverdue < minDaysOverdue) continue
          
//           // Get fee type details
//           const feeTypeDetails = await FeesType.query()
//             .where('id', installment.fee_plan_details.fees_type_id)
//             .first()
          
//           overdueRecords.push({
//             student_id: feesMaster.student?.id,
//             student_name: feesMaster.student ? 
//               `${feesMaster.student.first_name} ${feesMaster.student.middle_name || ''} ${feesMaster.student.last_name}` : 
//               'Unknown',
//             gr_no: feesMaster.student?.gr_no || '-',
//             roll_number: feesMaster.student?.roll_number || '-',
//             class: feesMaster.student?.academic_class?.division?.class?.class || '-',
//             division: feesMaster.student?.academic_class?.division?.division || '-',
//             installment_id: installment.id,
//             installment_no: installment.installment_no,
//             due_date: this.formatDate(installment.due_date),
//             days_overdue: daysOverdue,
//             fee_type_id: installment.fee_plan_details.fees_type_id,
//             fee_type_name: feeTypeDetails?.name || `Fee Type #${installment.fee_plan_details.fees_type_id}`,
//             installment_type: installment.fee_plan_details.installment_type,
//             installment_amount: installment.installment_amount,
//             paid_amount: paymentRecord?.paid_amount || 0,
//             discounted_amount: paymentRecord?.discounted_amount || 0,
//             remaining_amount: paymentRecord ? 
//               paymentRecord.remaining_amount : 
//               installment.installment_amount,
//             payment_status: paymentRecord ? 
//               (Number(paymentRecord.remaining_amount) > 0 ? 'Partially Paid' : 'Paid') : 
//               'Unpaid'
//           })
//         }
//       }
//     }
    
//     // Sort by days overdue (descending)
//     overdueRecords.sort((a, b) => b.days_overdue - a.days_overdue)
    
//     // Apply pagination manually
//     const startIndex = (page - 1) * limit
//     const endIndex = page * limit
//     const paginatedRecords = overdueRecords.slice(startIndex, endIndex)
    
//     // Group by class and division for summary
//     const classSummary = {}
//     overdueRecords.forEach(record => {
//       const key = `${record.class}-${record.division}`
      
//       if (!classSummary[key]) {
//         classSummary[key] = {
//           class: record.class,
//           division: record.division,
//           student_count: 0,
//           total_overdue_amount: 0,
//           students: new Set()
//         }
//       }
      
//       classSummary[key].students.add(record.student_id)
//       classSummary[key].total_overdue_amount += Number(record.remaining_amount)
//     })
    
//     // Convert sets to counts
//     Object.values(classSummary).forEach(summary => {
//       summary.student_count = summary.students.size
//       delete summary.students
//     })
    
//     return ctx.response.json({
//       data: paginatedRecords,
//       meta: {
//         total: overdueRecords.length,
//         per_page: limit,
//         current_page: page,
//         last_page: Math.ceil(overdueRecords.length / limit),
//         first_page: 1,
//         first_page_url: `?page=1`,
//         last_page_url: `?page=${Math.ceil(overdueRecords.length / limit)}`,
//         next_page_url: page < Math.ceil(overdueRecords.length / limit) ? `?page=${page + 1}` : null,
//         previous_page_url: page > 1 ? `?page=${page - 1}` : null
//       },
//       summary: {
//         total_overdue_students: new Set(overdueRecords.map(record => record.student_id)).size,
//         total_overdue_installments: overdueRecords.length,
//         total_overdue_amount: overdueRecords.reduce((sum, record) => sum + Number(record.remaining_amount), 0),
//         class_summary: Object.values(classSummary),
//         academic_session: academicSession!.session_name
//       }
//     })
//   }

//   /**
//    * 5. DATE RANGE / DAILY COLLECTION REPORTS
//    */

//   /**
//    * Daily Collection Report
//    * All payments received on a specific date
//    * Can include payment mode filter
//    */
//   async dailyCollectionReport(ctx: HttpContext) {
//     const academicSessionValidation = await this.validateAcademicSession(ctx)
//     if (!academicSessionValidation.isValid) return academicSessionValidation.response

//     const academicSession = academicSessionValidation.academicSession
    
//     // Get filters
//     const date = ctx.request.input('date', new Date().toISOString().split('T')[0])
//     const paymentMode = ctx.request.input('payment_mode')
    
//     // Parse date
//     const startDate = new Date(date)
//     startDate.setHours(0, 0, 0, 0)
    
//     const endDate = new Date(date)
//     endDate.setHours(23, 59, 59, 999)
    
//     // Build query for payments on this date
//     let query = StudentFeesInstallments.query()
//       .whereBetween('payment_date', [startDate.toISOString(), endDate.toISOString()])
//       .preload('student_fees_master', (query) => {
//         query.where('academic_session_id', academicSession!.id)
//         query.preload('student', (query) => {
//           query.select('id', 'first_name', 'middle_name', 'last_name', 'gr_no', 'roll_number')
//           query.preload('academic_class', (query) => {
//             query.where('academic_session_id', academicSession!.id)
//             query.preload('division', (query) => {
//               query.preload('class')
//             })
//           })
//         })
//         query.preload('fees_plan')
//       })
//       .preload('applied_concessions', (query) => {
//         query.preload('concession')
//       })
//       .whereHas('student_fees_master', (builder) => {
//         builder.where('academic_session_id', academicSession!.id)
//       })
    
//     // Apply payment mode filter
//     if (paymentMode) {
//       query = query.where('payment_mode', paymentMode)
//     }
    
//     const payments = await query
    
//     // Get installment details for each payment
//     const paymentDetails = await Promise.all(payments.map(async (payment) => {
//       const installment = await InstallmentBreakDowns.query()
//         .where('id', payment.installment_id)
//         .preload('fee_plan_details', (query) => {
//           query.preload('fees_type')
//         })
//         .first()
      
//       return {
//         payment_id: payment.id,
//         receipt_number: `REC-${payment.id.toString().padStart(6, '0')}`,
//         payment_date: this.formatDate(payment.payment_date),
//         payment_mode: payment.payment_mode,
//         amount: payment.paid_amount,
//         discount: payment.discounted_amount,
//         carry_forward: payment.amount_paid_as_carry_forward,
//         remaining: payment.remaining_amount,
//         status: payment.status,
//         transaction_reference: payment.transaction_reference || '-',
//         remarks: payment.remarks || '-',
//         student_id: payment.student_fees_master?.student?.id,
//         student_name: payment.student_fees_master?.student ? 
//           `${payment.student_fees_master.student.first_name} ${payment.student_fees_master.student.middle_name || ''} ${payment.student_fees_master.student.last_name}` : 
//           'Unknown',
//         gr_no: payment.student_fees_master?.student?.gr_no || '-',
//         roll_number: payment.student_fees_master?.student?.roll_number || '-',
//         class: payment.student_fees_master?.student?.academic_class?.division?.class?.class || '-',
//         division: payment.student_fees_master?.student?.academic_class?.division?.division || '-',
//         installment_details: installment ? {
//           installment_id: installment.id,
//           installment_no: installment.installment_no,
//           due_date: this.formatDate(installment.due_date),
//           fee_type: installment.fee_plan_details?.fees_type?.name || 'Unknown',
//           installment_type: installment.fee_plan_details?.installment_type || 'Unknown'
//         } : null,
//         applied_concessions: payment.applied_concessions.map(concession => ({
//           concession_id: concession.concession_id,
//           concession_name: concession.concession?.name || `Concession #${concession.concession_id}`,
//           amount: concession.applied_amount
//         }))
//       }
//     }))
    
//     // Group by payment mode for summary
//     const paymentModeSummary = {}
//     paymentDetails.forEach(payment => {
//       const mode = payment.payment_mode
      
//       if (!paymentModeSummary[mode]) {
//         paymentModeSummary[mode] = {
//           payment_mode: mode,
//           transaction_count: 0,
//           total_amount: 0,
//           total_discount: 0
//         }
//       }
      
//       paymentModeSummary[mode].transaction_count += 1
//       paymentModeSummary[mode].total_amount += Number(payment.amount)
//       paymentModeSummary[mode].total_discount += Number(payment.discount)
//     })
    
//     // Calculate overall totals
//     const overallTotals = {
//       total_transactions: paymentDetails.length,
//       total_amount: paymentDetails.reduce((sum, payment) => sum + Number(payment.amount), 0),
//       total_discount: paymentDetails.reduce((sum, payment) => sum + Number(payment.discount), 0),
//       total_students: new Set(paymentDetails.map(payment => payment.student_id)).size
//     }

//     return ctx.response.json({
//       data: paymentDetails,
//       summary: {
//         date: this.formatDate(date),
//         ...overallTotals,
//         payment_mode_summary: Object.values(paymentModeSummary),
//         academic_session: academicSession!.session_name
//       }
//     })
//   }

//   /**
//    * Monthly Collection Trend Report
//    * Monthly collection amounts for the year
//    * Graph view and downloadable sheet
//    */
//   async monthlyCollectionTrendReport(ctx: HttpContext) {
//     const academicSessionValidation = await this.validateAcademicSession(ctx)
//     if (!academicSessionValidation.isValid) return academicSessionValidation.response

//     const academicSession = academicSessionValidation.academicSession
    
//     // Get filters
//     const year = ctx.request.input('year', new Date().getFullYear())
//     const paymentMode = ctx.request.input('payment_mode')
//     const feeTypeId = ctx.request.input('fee_type_id')
    
//     // Build query for payments in this academic session
//     let query = StudentFeesInstallments.query()
//       .preload('student_fees_master', (query) => {
//         query.where('academic_session_id', academicSession!.id)
//       })
//       .whereHas('student_fees_master', (builder) => {
//         builder.where('academic_session_id', academicSession!.id)
//       })
    
//     // Apply payment mode filter
//     if (paymentMode) {
//       query = query.where('payment_mode', paymentMode)
//     }
    
//     const payments = await query
    
//     // Filter payments by year
//     const filteredPayments = payments.filter(payment => {
//       const paymentYear = new Date(payment.payment_date).getFullYear()
//       return paymentYear === Number(year)
//     })
    
//     // Group payments by month
//     const monthlyData = {}
//     for (let month = 0; month < 12; month++) {
//       const monthName = new Date(Number(year), month, 1).toLocaleString('default', { month: 'long' })
//       monthlyData[monthName] = {
//         month: monthName,
//         month_number: month + 1,
//         year: Number(year),
//         total_amount: 0,
//         total_discount: 0,
//         transaction_count: 0
//       }
//     }
    
//     // Process payments
//     for (const payment of filteredPayments) {
//       const paymentDate = new Date(payment.payment_date)
//       const monthName = paymentDate.toLocaleString('default', { month: 'long' })
      
//       // If fee type filter is applied, check if payment is for this fee type
//       if (feeTypeId) {
//         const installment = await InstallmentBreakDowns.query()
//           .where('id', payment.installment_id)
//           .preload('fee_plan_details')
//           .first()
        
//         if (!installment || installment.fee_plan_details?.fees_type_id !== Number(feeTypeId)) {
//           continue
//         }
//       }
      
//       monthlyData[monthName].total_amount += Number(payment.paid_amount)
//       monthlyData[monthName].total_discount += Number(payment.discounted_amount)
//       monthlyData[monthName].transaction_count += 1
//     }
    
//     // Convert to array and sort by month number
//     const monthlyTrend = Object.values(monthlyData).sort((a, b) => a.month_number - b.month_number)
    
//     // Calculate quarterly data
//     const quarterlyData = [
//       {
//         quarter: 'Q1',
//         months: ['January', 'February', 'March'],
//         total_amount: 0,
//         total_discount: 0,
//         transaction_count: 0
//       },
//       {
//         quarter: 'Q2',
//         months: ['April', 'May', 'June'],
//         total_amount: 0,
//         total_discount: 0,
//         transaction_count: 0
//       },
//       {
//         quarter: 'Q3',
//         months: ['July', 'August', 'September'],
//         total_amount: 0,
//         total_discount: 0,
//         transaction_count: 0
//       },
//       {
//         quarter: 'Q4',
//         months: ['October', 'November', 'December'],
//         total_amount: 0,
//         total_discount: 0,
//         transaction_count: 0
//       }
//     ]
    
//     // Populate quarterly data
//     monthlyTrend.forEach(month => {
//       for (const quarter of quarterlyData) {
//         if (quarter.months.includes(month.month)) {
//           quarter.total_amount += month.total_amount
//           quarter.total_discount += month.total_discount
//           quarter.transaction_count += month.transaction_count
//           break
//         }
//       }
//     })
    
//     // Calculate overall totals
//     const overallTotals = {
//       total_amount: monthlyTrend.reduce((sum, month) => sum + month.total_amount, 0),
//       total_discount: monthlyTrend.reduce((sum, month) => sum + month.total_discount, 0),
//       total_transactions: monthlyTrend.reduce((sum, month) => sum + month.transaction_count, 0)
//     }
    
//     // Get fee type name if filter is applied
//     let feeTypeName = null
//     if (feeTypeId) {
//       const feeType = await FeesType.query().where('id', feeTypeId).first()
//       feeTypeName = feeType?.name
//     }

//     return ctx.response.json({
//       monthly_trend: monthlyTrend,
//       quarterly_trend: quarterlyData,
//       summary: {
//         year,
//         payment_mode: paymentMode || 'All',
//         fee_type: feeTypeName || 'All',
//         ...overallTotals,
//         academic_session: academicSession!.session_name
//       }
//     })
//   }

//   /**
//    * Fee Collection Register
//    * Manual-like register of all transactions
//    */
//   async feeCollectionRegister(ctx: HttpContext) {
//     const academicSessionValidation = await this.validateAcademicSession(ctx)
//     if (!academicSessionValidation.isValid) return academicSessionValidation.response

//     const academicSession = academicSessionValidation.academicSession
    
//     // Get filters
//     const startDate = ctx.request.input('start_date')
//     const endDate = ctx.request.input('end_date')
//     const paymentMode = ctx.request.input('payment_mode')
//     const classId = ctx.request.input('class_id')
//     const divisionId = ctx.request.input('division_id')
//     const page = ctx.request.input('page', 1)
//     const limit = ctx.request.input('limit', 20)
    
//     // Build query for payments
//     let query = StudentFeesInstallments.query()
//       .preload('student_fees_master', (query) => {
//         query.where('academic_session_id', academicSession!.id)
//         query.preload('student', (query) => {
//           query.select('id', 'first_name', 'middle_name', 'last_name', 'gr_no', 'roll_number')
//           query.preload('academic_class', (query) => {
//             query.where('academic_session_id', academicSession!.id)
//             query.preload('division', (query) => {
//               query.preload('class')
//             })
//           })
//         })
//       })
//       .whereHas('student_fees_master', (builder) => {
//         builder.where('academic_session_id', academicSession!.id)
//       })
//       .orderBy('payment_date', 'desc')
    
//     // Apply filters
//     if (startDate) {
//       query = query.where('payment_date', '>=', startDate)
//     }
    
//     if (endDate) {
//       query = query.where('payment_date', '<=', endDate)
//     }
    
//     if (paymentMode) {
//       query = query.where('payment_mode', paymentMode)
//     }
    
//     if (classId || divisionId) {
//       query = query.whereHas('student_fees_master', (builder) => {
//         builder.whereHas('student', (builder) => {
//           builder.whereHas('academic_class', (builder) => {
//             if (divisionId) {
//               builder.where('division_id', divisionId)
//             } else if (classId) {
//               builder.whereHas('division', (builder) => {
//                 builder.where('class_id', classId)
//               })
//             }
//           })
//         })
//       })
//     }
    
//     // Execute query with pagination
//     const payments = await query.paginate(page, limit)
//     const { data, meta } = payments.toJSON()
    
//     // Process data for report
//     const registerEntries = await Promise.all(data.map(async (payment) => {
//       const installment = await InstallmentBreakDowns.query()
//         .where('id', payment.installment_id)
//         .preload('fee_plan_details', (query) => {
//           query.preload('fees_type')
//         })
//         .first()
      
//       return {
//         payment_id: payment.id,
//         receipt_number: `REC-${payment.id.toString().padStart(6, '0')}`,
//         payment_date: this.formatDate(payment.payment_date),
//         payment_mode: payment.payment_mode,
//         transaction_reference: payment.transaction_reference || '-',
//         student_id: payment.student_fees_master?.student?.id,
//         student_name: payment.student_fees_master?.student ? 
//           `${payment.student_fees_master.student.first_name} ${payment.student_fees_master.student.middle_name || ''} ${payment.student_fees_master.student.last_name}` : 
//           'Unknown',
//         gr_no: payment.student_fees_master?.student?.gr_no || '-',
//         roll_number: payment.student_fees_master?.student?.roll_number || '-',
//         class: payment.student_fees_master?.student?.academic_class?.division?.class?.class || '-',
//         division: payment.student_fees_master?.student?.academic_class?.division?.division || '-',
//         fee_type: installment?.fee_plan_details?.fees_type?.name || 'Unknown',
//         installment_type: installment?.fee_plan_details?.installment_type || 'Unknown',
//         installment_no: installment?.installment_no || '-',
//         amount: payment.paid_amount,
//         discount: payment.discounted_amount,
//         carry_forward: payment.amount_paid_as_carry_forward,
//         remaining: payment.remaining_amount,
//         status: payment.status,
//         remarks: payment.remarks || '-'
//       }
//     }))
    
//     // Group by payment mode for summary
//     const paymentModeSummary = {}
//     registerEntries.forEach(entry => {
//       const mode = entry.payment_mode
      
//       if (!paymentModeSummary[mode]) {
//         paymentModeSummary[mode] = {
//           payment_mode: mode,
//           transaction_count: 0,
//           total_amount: 0,
//           total_discount: 0
//         }
//       }
      
//       paymentModeSummary[mode].transaction_count += 1
//       paymentModeSummary[mode].total_amount += Number(entry.amount)
//       paymentModeSummary[mode].total_discount += Number(entry.discount)
//     })
    
//     // Calculate totals for current page
//     const pageTotals = {
//       total_amount: registerEntries.reduce((sum, entry) => sum + Number(entry.amount), 0),
//       total_discount: registerEntries.reduce((sum, entry) => sum + Number(entry.discount), 0),
//       total_transactions: registerEntries.length
//     }

//     return ctx.response.json({
//       data: registerEntries,
//       meta,
//       summary: {
//         page_totals: pageTotals,
//         payment_mode_summary: Object.values(paymentModeSummary),
//         date_range: {
//           start_date: startDate ? this.formatDate(startDate) : 'All time',
//           end_date: endDate ? this.formatDate(endDate) : 'Present'
//         },
//         academic_session: academicSession!.session_name
//       }
//     })
//   }
// }