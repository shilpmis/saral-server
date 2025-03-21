import AcademicSession from '#models/AcademicSession'
import Classes from '#models/Classes'
import ConcessionFeesPlanMaster from '#models/ConcessionFeesPlanMaster'
import Concessions from '#models/Concessions'
import ConcessionStudentMaster from '#models/ConcessionStudentMaster'
import FeesPlan from '#models/FeesPlan'
import FeesPlanDetails from '#models/FeesPlanDetails'
import FeesType from '#models/FeesType'
import InstallmentBreakDowns from '#models/InstallmentBreakDowns'
import StudentFeesInstallments from '#models/StudentFeesInstallments'
import StudentFeesMaster from '#models/StudentFeesMaster'
import Students from '#models/Students'
import {
  CreateValidationForApplyConcessionToPlan,
  CreateValidationForApplyConcessionToStudent,
  CreateValidationForConcessionType,
  CreateValidationForMultipleInstallments,
  CreateValidationForPayFees,
  CreateValidatorForFeesPlan,
  CreateValidatorForFeesType,
  UpdateValidationForConcessionType,
  UpdateValidationForInstallment,
  UpdateValidatorForFeesPlan,
  UpdateValidatorForFeesType,
} from '#validators/Fees'
import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import { HasOne } from '@adonisjs/lucid/types/relations'

export default class FeesController {
  async indexFeesTyeForSchool(ctx: HttpContext) {
    let academic_session_id = ctx.request.input('academic_session')
    if (!academic_session_id) {
      return ctx.response.status(400).json({
        message: 'Please provide academic_session_id',
      })
    }
    let academic_years = await AcademicSession.query()
      .where('id', academic_session_id)
      .andWhere('is_active', 1)
      .andWhere('school_id', ctx.auth.user!.id)

    if (!academic_years) {
      return ctx.response.status(404).json({
        message: 'No active academic year found for this school',
      })
    }
    let fetch_all = ctx.request.input('all', false)
    let fees_types: FeesType[] = []
    if (!fetch_all) {
      fees_types = await FeesType.query()
        .where('school_id', ctx.auth.user!.school_id)
        .andWhere('academic_session_id', academic_session_id)
        .paginate(ctx.request.input('page', 1), 10)
    } else {
      fees_types = await FeesType.query()
        .where('school_id', ctx.auth.user!.school_id)
        .andWhere('academic_session_id', academic_session_id)
      // .paginate(ctx.request.input('page', 1), 10);
    }
    return ctx.response.json(fees_types)
  }

  async createFeesType(ctx: HttpContext) {
    if (ctx.auth.user?.role_id !== 1) {
      return ctx.response.status(401).json({
        message: 'You are not authorized to perform this action !',
      })
    }

    let payload = await CreateValidatorForFeesType.validate(ctx.request.body())

    let academic_session_id = payload.academic_session_id

    let academic_years = await AcademicSession.query()
      .where('id', academic_session_id)
      .andWhere('school_id', ctx.auth.user!.school_id)
      .first()

    if (!academic_years) {
      return ctx.response.status(404).json({
        message: 'No active academic year found for this school',
      })
    }

    if (!academic_years.is_active) {
      return ctx.response.status(400).json({
        message: 'Academic session is not active',
      })
    }

    let fees_type = await FeesType.create({
      ...payload,
      academic_session_id: academic_session_id,
      school_id: ctx.auth.user.school_id,
    })

    return ctx.response.status(201).json(fees_type)
  }

  async updateFeesType(ctx: HttpContext) {
    if (ctx.auth.user?.role_id !== 1) {
      return ctx.response.status(401).json({
        message: 'You are not authorized to perform this action !',
      })
    }
    let payload = await UpdateValidatorForFeesType.validate(ctx.request.body())

    let fees_type = await FeesType.query()
      .where('id', ctx.params.id)
      .andWhere('school_id', ctx.auth.user.school_id)
      .first()

    if (!fees_type) {
      return ctx.response.status(404).json({
        message: 'Fees Type not found',
      })
    }

    let academic_session = await AcademicSession.query()
      .where('id', fees_type?.academic_session_id)
      .andWhere('school_id', ctx.auth.user.school_id)
      .first()

    if (!academic_session) {
      return ctx.response.status(404).json({
        message: 'No active acadaemic session found for this fees type .',
      })
    }

    if (!academic_session.is_active) {
      return ctx.response.status(400).json({
        message: 'Academic session for this fees type is not active',
      })
    }

    if (payload.status === 'Inactive') {
      let active_plan_for_fees_type = await FeesPlanDetails.query()
        .where('fees_type_id', fees_type.id)
        .andWhere('status', 'Active')
        .first()

      if (active_plan_for_fees_type) {
        return ctx.response.status(400).json({
          message: 'Can not inactive this fees type because it is used in active fees plan',
        })
      }
    }
    try {
      fees_type.merge(payload).save()
    } catch (error) {
      return ctx.response.status(500).json({
        message: 'Internal Server Error',
        error: error,
      })
    }

    return ctx.response.status(201).json(fees_type)
  }

  async indexFeesPlanForSchool(ctx: HttpContext) {
    let academic_session_id = ctx.request.input('academic_session')
    let academic_years = await AcademicSession.query()
      .where('id', academic_session_id)
      .andWhere('is_active', 1)
      .andWhere('school_id', ctx.auth.user!.school_id)

    // let plan_id = ctx.request.input('plan_id');
    if (!academic_years) {
      return ctx.response.status(404).json({
        message: 'No active academic year found for this school',
      })
    }

    let fees_types = await FeesPlan.query()
      .preload('concession_for_plan', (query) => {
        query.preload('concession').where('academic_session_id', academic_session_id)
      })
      .where('academic_session_id', academic_session_id)
      .andWhere('status', 'Active')
      .paginate(ctx.request.input('page', 1), 10)

    return ctx.response.json(fees_types)
  }

  async fetchFeesPlanDetails(ctx: HttpContext) {
    let plan_id = ctx.params.plan_id

    type TypeForResObj = {
      fees_plan: FeesPlan | null
      consession: ConcessionFeesPlanMaster[] | null
      fees_types: {
        fees_type: FeesPlanDetails
        installment_breakDowns: InstallmentBreakDowns[]
      }[]
    }

    let resObj: TypeForResObj = {
      fees_plan: null,
      fees_types: [],
      consession: null,
    }

    if (!plan_id) {
      return ctx.response.status(400).json({
        message: 'Please provide plan_id',
      })
    }

    let plan = await FeesPlan.query().where('id', plan_id).first()

    if (!plan) {
      return ctx.response.status(404).json({
        message: 'No fees plan found for this school',
      })
    }

    // let academic_session_id = ctx.request.input('academic_session')
    // console.log('academic_session_id', academic_session_id)

    let academic_years = await AcademicSession.query()
      .where('id', plan.academic_session_id)
      .andWhere('is_active', 1)
      .andWhere('school_id', ctx.auth.user!.school_id)

    if (!academic_years) {
      return ctx.response.status(404).json({
        message: 'You are not authorized to perform this action !',
      })
    }

    resObj.fees_plan = plan

    let fees_types = await FeesPlanDetails.query()
      // .where('academic_session_id', plan.academic_session_id)
      .where('fees_plan_id', plan_id)

    for (let i = 0; i < fees_types.length; i++) {
      let installment_breakDowns: InstallmentBreakDowns[] =
        await InstallmentBreakDowns.query().where('fee_plan_details_id', fees_types[i].id)
      resObj.fees_types.push({
        fees_type: fees_types[i],
        installment_breakDowns: installment_breakDowns,
      })
    }

    let consession = await ConcessionFeesPlanMaster.query().where('fees_plan_id', plan_id)
    if (consession.length > 0) {
      resObj.consession = consession
    }

    return ctx.response.json(resObj)
  }

  async createFeePlan(ctx: HttpContext) {
    if (ctx.auth.user?.role_id !== 1) {
      return ctx.response.status(401).json({
        message: 'You are not authorized to perform this action !',
      })
    }

    let { academic_session_id, ...payload } = await CreateValidatorForFeesPlan.validate(
      ctx.request.body()
    )

    let academic_years = await AcademicSession.query()
      .where('id', academic_session_id)
      .andWhere('is_active', 1)
      .andWhere('school_id', ctx.auth.user!.school_id)
      .first()

    if (!academic_years) {
      return ctx.response.status(404).json({
        message: 'No active academic year found for this school',
      })
    }

    type res = {
      fees_plan: FeesPlan
      fees_types: {
        fees_type: FeesPlanDetails
        installment_breakDowns: InstallmentBreakDowns[]
      }[]
    }

    let trx = await db.transaction()

    try {
      let fees_type = await FeesPlan.create(
        {
          ...payload.fees_plan,
          academic_session_id: academic_years.id,
          total_amount: payload.plan_details.reduce(
            (acc: number, detail: any) => acc + detail.total_amount,
            0
          ),
        },
        { client: trx }
      )

      let resp: res = {
        fees_plan: fees_type,
        fees_types: [],
      }

      for (let i = 0; i < payload.plan_details.length; i++) {
        let fees_plan_details = await FeesPlanDetails.create(
          {
            fees_type_id: payload.plan_details[i].fees_type_id,
            total_amount: payload.plan_details[i].total_amount,
            total_installment: payload.plan_details[i].total_installment,
            installment_type: payload.plan_details[i].installment_type,
            academic_session_id: academic_session_id,
            fees_plan_id: fees_type.id,
            status: 'Active',
          },
          { client: trx }
        )

        resp.fees_types.push({
          fees_type: fees_plan_details,
          installment_breakDowns: [],
        })

        for (let j = 0; j < payload.plan_details[i].installment_breakDowns.length; j++) {
          let installment_breakDowns = await InstallmentBreakDowns.create(
            {
              ...payload.plan_details[i].installment_breakDowns[j],
              fee_plan_details_id: fees_plan_details.id,
              status: 'Active',
            },
            { client: trx }
          )

          resp.fees_types[i].installment_breakDowns.push(installment_breakDowns)
        }
      }
      await trx.commit()
      return ctx.response.status(201).json(resp)
    } catch (error) {
      await trx.rollback()
      return ctx.response.status(500).json({
        message: 'Internal Server Error',
        errors: error,
      })
    }
  }

  async updatePlan(ctx: HttpContext) {
    let plan_id = ctx.params.plan_id
    if (ctx.auth.user?.role_id !== 1) {
      return ctx.response.status(401).json({
        message: 'You are not authorized to perform this action !',
      })
    }

    const paylaod = await UpdateValidatorForFeesPlan.validate(ctx.request.body())

    let plan = await FeesPlan.query().where('id', plan_id).first()

    if (!plan) {
      return ctx.response.status(404).json({
        message: 'Plan not found',
      })
    }

    let academic_session = await AcademicSession.query()
      .where('id', plan.academic_session_id)
      .andWhere('school_id', ctx.auth.user!.school_id)
      .first()

    if (!academic_session) {
      return ctx.response.status(404).json({
        message: 'No active academic session found for this plan',
      })
    }

    if (!academic_session.is_active) {
      return ctx.response.status(400).json({
        message: 'Academic session for this plan is not active',
      })
    }

    let trx = await db.transaction()

    try {
      if (paylaod.fees_plan) await plan.merge(paylaod.fees_plan).useTransaction(trx).save()

      if (paylaod.plan_details && paylaod.plan_details.length !== 0) {
        for (let detail of paylaod.plan_details) {
          let fees_plan_detail = await FeesPlanDetails.create(
            {
              fees_type_id: detail.fees_type_id,
              total_amount: detail.total_amount,
              total_installment: detail.total_installment,
              installment_type: detail.installment_type,
              fees_plan_id: plan.id,
              status: 'Active',
            },
            { client: trx }
          )

          for (let breakdown of detail.installment_breakDowns) {
            await InstallmentBreakDowns.create(
              {
                ...breakdown,
                fee_plan_details_id: fees_plan_detail.id,
                status: 'Active',
              },
              { client: trx }
            )
          }
          // udpate fees plan details
        }
        await plan
          .merge({
            total_amount:
              Number(plan.total_amount) +
              paylaod.plan_details.reduce((acc, detail) => acc + detail.total_amount, 0),
          })
          .useTransaction(trx)
          .save()
      }
      console.log('paylaod', plan)

      await trx.commit()
      return ctx.response.status(200).json(plan)
    } catch (error) {
      await trx.rollback()
      return ctx.response.status(500).json({
        message: 'Internal Server Error',
        error: error,
      })
    }
  }

  /** */
  async fetchFeesStatusForClass(ctx: HttpContext) {
    let class_id = ctx.params.class_id
    if (!class_id) {
      return ctx.response.status(400).json({
        message: 'Please provide class_id',
      })
    }

    let academic_session_id = ctx.request.input('academic_session')
    let academic_year = await AcademicSession.query()
      .where('id', academic_session_id)
      .andWhere('is_active', 1)
      .andWhere('school_id', ctx.auth.user!.id)
      .first()

    if (!academic_year) {
      return ctx.response.status(404).json({
        message: 'No active academic year found for this school',
      })
    }

    if (!academic_year.is_active) {
      return ctx.response.status(400).json({
        message: 'Academic session is not active',
      })
    }

    let clas = await Classes.query()
      .where('id', class_id)
      .andWhere('school_id', ctx.auth.user!.school_id)
      .first()

    if (!clas) {
      return ctx.response.status(404).json({
        message: 'Class not found',
      })
    }

    let fees_paln_for_clas = await FeesPlan.query()
      .where('class_id', class_id)
      .andWhere('academic_session_id', academic_session_id)
      .first()

    if (!fees_paln_for_clas) {
      return ctx.response.status(404).json({
        message: 'No fees plan found for this class in which student belongs !',
      })
    }

    let students = await Students.query()
      .select('id', 'first_name', 'middle_name', 'last_name', 'gr_no', 'roll_number')
      .preload('fees_status')
      .where('class_id', class_id)
      .andWhere('school_id', ctx.auth.user!.school_id)
      .paginate(ctx.request.input('page', 1), 10)

    let { data, meta } = students.toJSON()

    let res: Students[] = []

    for (let i = 0; i < data.length; i++) {
      if (!students[i].fees_status) {
        let student = students[i].serialize()
        student.fees_status = {
          student_id: students[i].id,
          academic_session_id: academic_session_id,
          fees_plan_id: fees_paln_for_clas.id,
          discounted_amount: 0,
          paid_amount: 0,
          total_amount: fees_paln_for_clas.total_amount,
          due_amount: fees_paln_for_clas.total_amount,
          status: 'Pending',
        }
        students[i] = student as Students
        res.push(student as Students)
      } else {
        res.push(students[i])
      }
    }

    return ctx.response.json({ data: res, meta })
  }
  /** */
  async fetchFeesStatusForSingleStundent(ctx: HttpContext) {
    let student_id = ctx.params.student_id

    if (!student_id) {
      return ctx.response.status(400).json({
        message: 'Please provide student_id',
      })
    }

    let student = await Students.query()
      .select('id', 'first_name', 'middle_name', 'last_name', 'gr_no', 'roll_number', 'class_id')
      .preload('fees_status')
      .preload('provided_concession')
      .where('id', student_id)
      .andWhere('school_id', ctx.auth.user!.school_id)
      .first()

    if (!student) {
      return ctx.response.status(404).json({
        message: 'Student not found',
      })
    }

    type res_type = {
      fees_plan: FeesPlan
      fees_details: FeesPlanDetails[]
      paid_fees: StudentFeesInstallments[]
    }

    let res: res_type = {
      fees_details: [],
      fees_plan: {} as FeesPlan,
      paid_fees: [],
    }

    let fees_Plan = await FeesPlan.query().where('class_id', student.class_id).first()

    if (!fees_Plan) {
      return ctx.response.status(404).json({
        message: 'No fees plan found for this Student',
      })
    }

    /**
     * Fetched payed fees for student
     */

    let student_obj: any = { ...student.serialize() }

    if (!student.fees_status) {
      student_obj.fees_status = {
        student_id: student.id,
        academic_session_id: 1,
        fees_plan_id: fees_Plan.id,
        discounted_amount: 0,
        paid_amount: 0,
        total_amount: fees_Plan.total_amount,
        due_amount: fees_Plan.total_amount,
        status: 'Pending',
      }
    } else {
      // let stundet_fees = await StudentFeesMaster.query().where('id', student.fees_status.id).first();
      let paid_fees = await StudentFeesInstallments.query().where(
        'student_fees_master_id',
        student.fees_status.id
      )
      res.paid_fees = paid_fees
    }

    let fees_details = await FeesPlanDetails.query()
      .preload('installments_breakdown')
      .where('fees_plan_id', fees_Plan.id)

    res.fees_plan = fees_Plan
    res.fees_details = fees_details

    // let concession = student.provided_concession
    // let paid_amount = res.paid_fees.reduce(
    //   (acc: number, fees: StudentFeesInstallments) => acc + fees.paid_amount,
    //   0
    // )
    /**
     * Consession management for student.
     */
    // let totoal_discount = 0
    // if (concession.length > 0) {
    //   let total_consession_amount = concession.reduce(
    //     (acc: number, cons: ConcessionStudentMaster) => {
    //       if (cons.amount) {
    //         return acc + cons.amount
    //       }
    //       return acc
    //     },
    //     0
    //   )
    //   let total_consession_percentage = concession.reduce(
    //     (acc: number, cons: ConcessionStudentMaster) => {
    //       if (cons.percentage) {
    //         return acc + (cons.percentage * fees_Plan.total_amount) / 100
    //       }
    //       return acc
    //     },
    //     0
    //   )
    //   totoal_discount = total_consession_amount + total_consession_percentage
    // }

    // if (paid_amount > res.fees_plan.total_amount - totoal_discount) {
    //   // let refundable_discount_amount = paid_amount - totoal_discount

    //   let stundentFeesInstallMent = await StudentFeesInstallments.query().where(
    //     'student_fees_master_id',
    //     student.fees_status.id
    //   )

    //   let all_installment = fees_details
    //     .map((detail: FeesPlanDetails) => detail.installments_breakdown)
    //     .map((installments: InstallmentBreakDowns[]) => installments)
    //     .flat()

    //   let unpaid_installments =
    //     stundentFeesInstallMent.length > 0
    //       ? all_installment.filter((installment: InstallmentBreakDowns) => {
    //           return !stundentFeesInstallMent
    //             .map((installment: StudentFeesInstallments) => installment.installment_id)
    //             .includes(installment.id)
    //         })
    //       : []
    // } else if (paid_amount < totoal_discount) {
    // } else {
    // }

    return ctx.response.json({ student: student_obj, fees_plan: res })
  }

  /** */
  async payFees(ctx: HttpContext) {
    let student_id = ctx.params.student_id

    if (!student_id) {
      return ctx.response.status(400).json({
        message: 'Please provide student_id',
      })
    }

    let student = await Students.query()
      .select('id', 'first_name', 'middle_name', 'last_name', 'gr_no', 'roll_number', 'class_id')
      .preload('fees_status')
      .where('id', student_id)
      .andWhere('school_id', ctx.auth.user!.school_id)
      .first()

    if (!student) {
      return ctx.response.status(404).json({
        message: 'Student not found',
      })
    }

    const payload = await CreateValidationForPayFees.validate(ctx.request.body())

    let fees_plan = await FeesPlan.query().where('class_id', student.class_id).first()

    if (!fees_plan) {
      return ctx.response.status(404).json({
        message: 'No fees plan found for this student',
      })
    }

    /**
     * TODO : Need to add more security checks
     */
    let fees_installment = await InstallmentBreakDowns.query()
      .andWhere('id', payload.installment_id)
      .first()

    if (!fees_installment) {
      return ctx.response.status(404).json({
        message: 'No installment found for this student',
      })
    }

    if (fees_installment.installment_amount.toString() !== payload.paid_amount) {
      return ctx.response.status(400).json({
        message: 'Paid amount is not equal to installment amount',
      })
    }

    let trx = await db.transaction()

    let concession = await ConcessionStudentMaster.query().where('student_id', student_id)

    let totoal_discount = 0
    if (concession.length > 0) {
      let total_consession_amount = concession.reduce(
        (acc: number, cons: ConcessionStudentMaster) => {
          if (cons.amount) {
            return acc + cons.amount
          }
          return acc
        },
        0
      )
      let total_consession_percentage = concession.reduce(
        (acc: number, cons: ConcessionStudentMaster) => {
          if (cons.percentage) {
            return acc + (cons.percentage * fees_plan.total_amount) / 100
          }
          return acc
        },
        0
      )
      totoal_discount = total_consession_amount + total_consession_percentage
    }

    let studentFeesMaster: StudentFeesMaster | null = null

    try {
      if (!student.fees_status) {
        studentFeesMaster = await StudentFeesMaster.create(
          {
            student_id: student_id,
            fees_plan_id: fees_plan.id,
            academic_session_id: 1,
            paid_amount: Number(payload.paid_amount),
            total_amount: fees_plan.total_amount,
            discounted_amount: totoal_discount,
            total_refund_amount: 0,
            refunded_amount: 0,
            due_amount: fees_plan.total_amount - Number(payload.paid_amount),
            status:
              fees_plan.total_amount - Number(payload.paid_amount) === 0
                ? 'Paid'
                : 'Partially Paid',
          },
          { client: trx }
        )
        student.fees_status = studentFeesMaster as HasOne<typeof StudentFeesMaster>
      } else {
        studentFeesMaster = await StudentFeesMaster.query().where('student_id', student.id).first()
        if (!studentFeesMaster) {
          await trx.rollback()
          return ctx.response.status(404).json({
            message: 'No fees master found for this student',
          })
        }

        await studentFeesMaster
          .merge({
            paid_amount: Number(student.fees_status!.paid_amount) + Number(payload.paid_amount),
            due_amount: Number(student.fees_status!.due_amount) - Number(payload.paid_amount),
            discounted_amount: totoal_discount,
            total_refund_amount:
              studentFeesMaster.total_refund_amount +
              (payload.paid_as_refund ? Number(payload.refunded_amount) : 0),
            status:
              student.fees_status!.due_amount - Number(payload.paid_amount) === 0
                ? 'Paid'
                : 'Partially Paid',
          })
          .useTransaction(trx)
          .save()
      }

      if (
        studentFeesMaster.total_amount - totoal_discount <
        studentFeesMaster.paid_amount + Number(payload.paid_amount)
      ) {
        await trx.rollback()
        return ctx.response.status(400).json({
          message:
            'Total paid amount is greater than total amount (after apply concession) , Need to pay this fees as a refund amount for student !',
        })
      }

      let StundedFeesMaster = await StudentFeesInstallments.create(
        {
          student_fees_master_id: student.fees_status.id,
          installment_id: fees_installment.id,
          paid_amount: Number(payload.paid_amount),
          remaining_amount: fees_installment.installment_amount - Number(payload.paid_amount),
          payment_mode: payload.payment_mode,
          transaction_reference: payload.transaction_reference,
          payment_date: payload.payment_date,
          remarks: payload.remarks,
          paid_as_refund: payload.paid_as_refund,
          refunded_amount: payload.paid_as_refund ? Number(payload.refunded_amount) : 0,
          status: fees_installment.due_date < new Date() ? 'Overdue' : 'Paid',
        },
        { client: trx }
      )

      await trx.commit()
      return ctx.response.json(StundedFeesMaster)
    } catch (error) {
      await trx.rollback()
      return ctx.response.status(500).json({
        message: 'Internal Server Error',
        error: error,
      })
    }
  }

  async payMultipleInstallments(ctx: HttpContext) {
    let student_id = ctx.params.student_id

    if (!student_id) {
      return ctx.response.status(400).json({
        message: 'Please provide student_id',
      })
    }

    let student = await Students.query()
      .select('id', 'first_name', 'middle_name', 'last_name', 'gr_no', 'roll_number', 'class_id')
      .preload('fees_status')
      .where('id', student_id)
      .andWhere('school_id', ctx.auth.user!.school_id)
      .first()

    if (!student) {
      return ctx.response.status(404).json({
        message: 'Student not found',
      })
    }

    const payload = await CreateValidationForMultipleInstallments.validate(ctx.request.body())

    let fees_plan = await FeesPlan.query().where('class_id', student.class_id).first()

    if (!fees_plan) {
      return ctx.response.status(404).json({
        message: 'No fees plan found for this student',
      })
    }

    let trx = await db.transaction()

    try {
      let total_payed_amount = payload.reduce(
        (acc: number, installment: any) => acc + Number(installment.paid_amount),
        0
      )

      if (!student.fees_status) {
        let studentFeesMaster = await StudentFeesMaster.create(
          {
            student_id: student_id,
            fees_plan_id: fees_plan.id,
            academic_session_id: 1,
            discounted_amount: 0,
            paid_amount: Number(total_payed_amount),
            total_amount: fees_plan.total_amount,
            due_amount: fees_plan.total_amount - Number(total_payed_amount),
            status:
              fees_plan.total_amount - Number(total_payed_amount) === 0 ? 'Paid' : 'Partially Paid',
          },
          { client: trx }
        )
        student.fees_status = studentFeesMaster as HasOne<typeof StudentFeesMaster>
      } else {
        let studentFeesMaster = await StudentFeesMaster.query()
          .where('student_id', student.id)
          .first()
        if (!studentFeesMaster) {
          await trx.rollback()
          return ctx.response.status(404).json({
            message: 'No fees master found for this student',
          })
        }
        await studentFeesMaster
          .merge({
            paid_amount: Number(student.fees_status!.paid_amount) + Number(total_payed_amount),
            due_amount: Number(student.fees_status!.due_amount) - Number(total_payed_amount),
            status:
              Number(student.fees_status!.due_amount) - Number(total_payed_amount) === 0
                ? 'Paid'
                : 'Partially Paid',
          })
          .useTransaction(trx)
          .save()
      }

      for (let installment of payload) {
        console.log(installment)
        let fees_installment = await InstallmentBreakDowns.query()
          .andWhere('id', installment.installment_id)
          .first()

        if (!fees_installment) {
          await trx.rollback()
          return ctx.response.status(404).json({
            message: `No installment found for installment number ${installment.installment_id}`,
          })
        }

        if (fees_installment.installment_amount.toString() !== installment.paid_amount) {
          await trx.rollback()
          return ctx.response.status(400).json({
            message: `Paid amount for installment number ${installment.installment_id} is not equal to installment amount`,
          })
        }

        await StudentFeesInstallments.create(
          {
            student_fees_master_id: student.fees_status.id,
            installment_id: fees_installment.id,
            paid_amount: Number(installment.paid_amount),
            remaining_amount: fees_installment.installment_amount - Number(installment.paid_amount),
            payment_mode: installment.payment_mode,
            transaction_reference: installment.transaction_reference,
            payment_date: installment.payment_date,
            remarks: installment.remarks,
            status: fees_installment.due_date < new Date() ? 'Overdue' : 'Paid',
          },
          { client: trx }
        )
      }

      await trx.commit()
      return ctx.response.status(201).json({
        message: 'Installments paid successfully',
      })
    } catch (error) {
      console.log('error', error)
      await trx.rollback()
      return ctx.response.status(500).json({
        message: 'Internal Server Error',
        error: error,
      })
    }
  }

  async updateFeesStatus(ctx: HttpContext) {
    let transaction_id = ctx.params.transaction_id

    let transaction = await StudentFeesInstallments.query().where('id', transaction_id).first()

    if (!transaction) {
      return ctx.response.status(404).json({
        message: 'Transaction not found',
      })
    }
    let payload = await UpdateValidationForInstallment.validate(ctx.request.body())
    let trx = await db.transaction()
    try {
      await transaction.merge(payload).useTransaction(trx).save()
      await trx.commit()
      return ctx.response.status(201).json(transaction)
    } catch (error) {
      await trx.rollback()
      return ctx.response.status(500).json({
        message: 'Internal Server Error',
        error: error,
      })
    }
  }

  // Concession

  async indexConcessionType(ctx: HttpContext) {
    let academic_session_id = ctx.request.input('academic_session')
    let academic_session = await AcademicSession.query()
      .where('id', academic_session_id)
      .andWhere('is_active', 1)
      .andWhere('school_id', ctx.auth.user!.id)
    if (!academic_session) {
      return ctx.response.status(404).json({
        message: 'No active academic year found for this school',
      })
    }

    let fetch_all = ctx.request.input('all', false)
    let concessions: Concessions[] = []
    if (!fetch_all) {
      concessions = await Concessions.query()
        .where('school_id', ctx.auth.user!.school_id)
        .andWhere('academic_session_id', academic_session_id)
        .paginate(ctx.request.input('page', 1), 10)
    } else {
      concessions = await Concessions.query()
        .where('school_id', ctx.auth.user!.school_id)
        .andWhere('academic_session_id', academic_session_id)
      // .paginate(ctx.request.input('page', 1), 10);
    }
    return ctx.response.json(concessions)
  }

  async fetchDetailConcessionType(ctx: HttpContext) {
    let concession_id = ctx.params.concession_id
    let concession = await Concessions.query().where('id', concession_id).first()
    if (!concession) {
      return ctx.response.status(404).json({
        message: 'Concession not found',
      })
    }
    /**
     *  Find  Applied Plan for this concession
     */

    type res = {
      concession: Concessions
      applied_plans: ConcessionFeesPlanMaster[] | null
    }

    let applied_plan = await ConcessionFeesPlanMaster.query()
      .preload('fees_plan')
      .where('concession_id', concession_id)
    // .andWhere('academic_session_id', );

    let response_obj: res = {
      concession: concession,
      applied_plans: applied_plan,
    }

    return ctx.response.json(response_obj)
  }

  async createConcession(ctx: HttpContext) {
    const payload = await CreateValidationForConcessionType.validate(ctx.request.body())

    let academic_session_id = payload.academic_session_id

    let academic_session = await AcademicSession.query()
      .where('id', academic_session_id)
      .andWhere('is_active', 1)
      .andWhere('school_id', ctx.auth.user!.id)

    if (!academic_session) {
      return ctx.response.status(404).json({
        message: 'No active academic year found for this school',
      })
    }

    if (ctx.auth.user!.role_id == 1 || ctx.auth.user!.role_id == 2) {
      let studentFeesMaster = await Concessions.create({
        ...payload,
        school_id: ctx.auth.user!.school_id,
      })
      return ctx.response.status(201).json(studentFeesMaster)
    } else {
      return ctx.response.status(401).json({
        message: 'You are not authorized to perform this action !',
      })
    }
  }

  async updateConcession(ctx: HttpContext) {
    if (ctx.auth.user!.role_id == 1 || ctx.auth.user!.role_id == 2) {
      const payload = await UpdateValidationForConcessionType.validate(ctx.request.body())
      let concession_id = ctx.params.concession_id
      let concession = await Concessions.query().where('id', concession_id).first()
      if (!concession) {
        return ctx.response.status(404).json({
          message: 'Concession not found',
        })
      }
      await concession.merge(payload).save()
      return ctx.response.status(201).json(concession)
    } else {
      return ctx.response.status(401).json({
        message: 'You are not authorized to perform this action !',
      })
    }
  }

  async applyConcessionToPlan(ctx: HttpContext) {
    if (ctx.auth.user!.role_id == 1 || ctx.auth.user!.role_id == 2) {
      const payload = await CreateValidationForApplyConcessionToPlan.validate(ctx.request.body())
      let studentFeesMaster = await ConcessionFeesPlanMaster.create({
        ...payload,
        academic_session_id: 1,
      })
      return ctx.response.status(201).json(studentFeesMaster)
    } else {
      return ctx.response.status(401).json({
        message: 'You are not authorized to perform this action !',
      })
    }
  }

  async applyConcessionToStudent(ctx: HttpContext) {
    if (ctx.auth.user!.role_id == 1 || ctx.auth.user!.role_id == 2) {
      const payload = await CreateValidationForApplyConcessionToStudent.validate(ctx.request.body())

      let student = await Students.query()
        .where('id', payload.student_id)
        .andWhere('school_id', ctx.auth.user!.school_id)
        .first()

      if (!student) {
        return ctx.response.status(404).json({
          message: 'Student not found',
        })
      }

      let class_id = student.class_id
      let fees_plan = await FeesPlan.query().where('class_id', class_id).first()
      if (!fees_plan) {
        return ctx.response.status(404).json({
          message: 'No fees plan found for this student',
        })
      }

      if (payload.deduction_type === 'fixed_amount' && !payload.amount) {
        return ctx.response.status(400).json({
          message: 'Amount is required for fixed amount deduction',
        })
      }

      if (payload.deduction_type === 'fixed_amount' && payload.percentage) {
        return ctx.response.status(400).json({
          message: 'Percentage should be null fixed amount deduction',
        })
      }

      if (payload.deduction_type === 'percentage' && !payload.percentage) {
        return ctx.response.status(400).json({
          message: 'Percentage is required for percentage deduction',
        })
      }

      if (payload.deduction_type === 'percentage' && payload.amount) {
        return ctx.response.status(400).json({
          message: 'Amount should be null for percentage deduction',
        })
      }

      if (payload.amount && payload.amount > fees_plan.total_amount) {
        return ctx.response.status(400).json({
          message: 'Concession amount cannot be greater than total fees amount',
        })
      }

      let consession = await Concessions.query()
        .where('id', payload.concession_id)
        .andWhere('school_id', ctx.auth.user!.school_id)
        .first()

      if (!consession) {
        return ctx.response.status(404).json({
          message: 'Concession not found',
        })
      }

      let consessionForStundent = await ConcessionStudentMaster.query()
        .where('student_id', student.id)
        .andWhere('concession_id', consession.id)
        .first()

      if (consessionForStundent) {
        return ctx.response.status(400).json({
          message: 'Concession already applied to this student',
        })
      }

      let studentFeesMaster = await ConcessionStudentMaster.create({
        ...payload,
        academic_session_id: 1,
        fees_plan_id: 1,
        fees_type_id: 1,
      })
      return ctx.response.status(201).json(studentFeesMaster)
    } else {
      return ctx.response.status(401).json({
        message: 'You are not authorized to perform this action !',
      })
    }
  }
}
