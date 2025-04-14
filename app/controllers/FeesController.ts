import AcademicSession from '#models/AcademicSession'
// import Classes from '#models/Classes'
import ConcessionFeesPlanMaster from '#models/ConcessionFeesPlanMaster'
import Concessions from '#models/Concessions'
import ConcessionStudentMaster from '#models/ConcessionStudentMaster'
import Divisions from '#models/Divisions'
import FeesPlan from '#models/FeesPlan'
import FeesPlanDetails from '#models/FeesPlanDetails'
import FeesType from '#models/FeesType'
import InstallmentBreakDowns from '#models/InstallmentBreakDowns'
import StudentEnrollments from '#models/StudentEnrollments'
import StudentFeesInstallments from '#models/StudentFeesInstallments'
import StudentFeesMaster from '#models/StudentFeesMaster'
import Students from '#models/Students'
import {
  CreateValidationForApplyConcessionToPlan,
  CreateValidationForApplyConcessionToStudent,
  CreateValidationForConcessionType,
  CreateValidationForMultipleInstallments,
  CreateValidatorForFeesPlan,
  CreateValidatorForFeesType,
  UpdateValidationForAppliedConcessionToPlan,
  UpdateValidationForAppliedConcessionToStudent,
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
      .andWhere('school_id', ctx.auth.user!.school_id)

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

    let filter_for_eligibility_to_apply_concession = ctx.request.input('eligible_for_concession')

    if (filter_for_eligibility_to_apply_concession) {
      let fees_types = await FeesPlan.query()
        .preload('concession_for_plan', (query) => {
          query
            .preload('concession')
            .where('academic_session_id', academic_session_id)
            .andWhere('status', 'Active')
        })
        .where('academic_session_id', academic_session_id)
        .andWhere('status', 'Active')
        .whereDoesntHave('concession_for_plan', (query) => {
          query
            .where('concession_id', filter_for_eligibility_to_apply_concession)
            .andWhere('status', 'Active')
        })
        .paginate(ctx.request.input('page', 1), 10)

      return ctx.response.json(fees_types)
    }

    let fees_types = await FeesPlan.query()
      .preload('concession_for_plan', (query) => {
        query
          .preload('concession')
          .where('academic_session_id', academic_session_id)
          .andWhere('status', 'Active')
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

    let consession = await ConcessionFeesPlanMaster.query()
      .where('fees_plan_id', plan_id)
      .andWhere('status', 'Active')
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
            // academic_session_id: academic_session_id,
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
      console.log(error)
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

      // update all student fees master according to this plan

      let student_fees_master = await StudentFeesMaster.query()
        .where('fees_plan_id', plan.id)
        .andWhere('academic_session_id', plan.academic_session_id)
      // .andWhere('status', 'Pending')

      for (let i = 0; i < student_fees_master.length; i++) {
        let student_fees = student_fees_master[i]
        await student_fees
          .merge({
            total_amount: plan.total_amount,
            due_amount: Number(plan.total_amount) - Number(student_fees.paid_amount),
            status: student_fees.paid_amount > 0 ? 'Partially Paid' : 'Pending',
          })
          .useTransaction(trx)
          .save()
      }

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

  async fetchFeesStatusForClass(ctx: HttpContext) {
    let division_id = ctx.params.division_id
    if (!division_id) {
      return ctx.response.status(400).json({
        message: 'Please provide class_id',
      })
    }

    let academic_session_id = ctx.request.input('academic_session')

    let academic_year = await AcademicSession.query()
      .where('id', academic_session_id)
      .andWhere('is_active', 1)
      .andWhere('school_id', ctx.auth.user!.school_id)
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

    let clas = await Divisions.query().where('id', division_id).first()
    // .andWhere('academic_session_id', academic_session_id)
    // .andWhere('school_id', ctx.auth.user!.school_id)

    if (!clas) {
      return ctx.response.status(404).json({
        message: 'Class not found',
      })
    }

    let fees_plan_for_clas = await FeesPlan.query()
      .where('division_id', division_id)
      .andWhere('academic_session_id', academic_session_id)
      .andWhere('status', 'Active')
      .first()

    if (!fees_plan_for_clas) {
      return ctx.response.status(404).json({
        message:
          'No fees plan found for this class in which student belongs ! Or may be plan for this class is been deactivated !',
      })
    }

    let student_enrollments = await StudentEnrollments.query()
      .where('division_id', division_id)
      .andWhere('academic_session_id', academic_session_id)

    if (student_enrollments.length === 0) {
      return ctx.response.status(404).json({
        message: 'No student found in this class for this academic session !',
      })
    }

    let filter_for_eligibility_to_apply_concession = ctx.request.input('eligible_for_concession')

    /**
     * Filter Student who are eligable to apply concession;
     */
    if (filter_for_eligibility_to_apply_concession) {
      let students = await Students.query()
        .select('id', 'first_name', 'middle_name', 'last_name', 'gr_no', 'roll_number')
        .preload('fees_status')
        .whereIn('id', [
          ...student_enrollments.map((student: StudentEnrollments) => student.student_id),
        ])
        .whereDoesntHave('provided_concession', (query) => {
          query
            .where('concession_id', filter_for_eligibility_to_apply_concession)
            .andWhere('status', 'Active')
        })
        .paginate(ctx.request.input('page', 1), 10)

      let { data, meta } = students.toJSON()

      let res: Students[] = []

      for (let i = 0; i < data.length; i++) {
        if (!students[i].fees_status) {
          let student = students[i].serialize()
          student.fees_status = {
            student_id: students[i].id,
            academic_session_id: academic_session_id,
            fees_plan_id: fees_plan_for_clas.id,
            discounted_amount: 0,
            paid_amount: 0,
            total_amount: fees_plan_for_clas.total_amount,
            due_amount: fees_plan_for_clas.total_amount,
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

    let students = await Students.query()
      .select('id', 'first_name', 'middle_name', 'last_name', 'gr_no', 'roll_number')
      .preload('fees_status')
      .whereIn('id', [
        ...student_enrollments.map((student: StudentEnrollments) => student.student_id),
      ])
      .paginate(ctx.request.input('page', 1), 10)

    let { data, meta } = students.toJSON()

    let res: Students[] = []

    for (let i = 0; i < data.length; i++) {
      if (!students[i].fees_status) {
        let student = students[i].serialize()
        student.fees_status = {
          student_id: students[i].id,
          academic_session_id: academic_session_id,
          fees_plan_id: fees_plan_for_clas.id,
          discounted_amount: 0,
          paid_amount: 0,
          total_amount: fees_plan_for_clas.total_amount,
          due_amount: fees_plan_for_clas.total_amount,
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

  async fetchFeesStatusForSingleStudent(ctx: HttpContext) {
    let student_id = ctx.params.student_id
    if (!student_id) {
      return ctx.response.status(400).json({
        message: 'Please provide student_id',
      })
    }

    let academicSession = await AcademicSession.query()
      .where('is_active', 1)
      .andWhere('school_id', ctx.auth.user!.school_id)
      .first()

    if (!academicSession) {
      return ctx.response.status(404).json({
        message: 'No active academic year found for this school',
      })
    }

    let student = await Students.query()
      .select('id', 'first_name', 'middle_name', 'last_name', 'gr_no', 'roll_number')
      .preload('fees_status')
      .preload('provided_concession', (query) => {
        query.preload('concession', (query) => {
          query.andWhere('status', 'Active')
        })
        query.andWhere('status', 'Active')
      })
      .preload('academic_class', (query) => {
        query.preload('division', (query) => {
          query.preload('class', (query) => {
            query.select('id', 'class').where('school_id', ctx.auth.user!.school_id)
          })
        })
        query.where('academic_session_id', academicSession.id)
      })
      .where('id', student_id)
      .andWhere('school_id', ctx.auth.user!.school_id)
      .first()

    if (!student) {
      return ctx.response.status(404).json({
        message: 'Student not found',
      })
    }

    let feesPlan = await FeesPlan.query()
      .preload('concession_for_plan', (query) => {
        query.preload('concession', (query) => {
          query.andWhere('status', 'Active')
        })
        query.andWhere('status', 'Active')
      })
      .where('division_id', student.academic_class[0].division_id)
      .andWhere('academic_session_id', academicSession.id)
      .andWhere('status', 'Active')
      .first()

    if (!feesPlan) {
      return ctx.response.status(404).json({
        message: 'No fees plan found for this Student',
      })
    }

    let feesDetails = await FeesPlanDetails.query()
      .preload('installments_breakdown')
      .where('fees_plan_id', feesPlan.id)

    type ResType = {
      fees_plan: FeesPlan
      fees_details: FeesPlanDetails[]
      paid_fees: StudentFeesInstallments[]
      wallet: {
        total_concession_for_student: number
        total_concession_for_plan: number
      }
    }

    let res: ResType = {
      fees_details: [],
      fees_plan: {} as FeesPlan,
      paid_fees: [],
      wallet: {
        total_concession_for_student: 0,
        total_concession_for_plan: 0,
      },
    }

    let totalConcessionAmountForStudent = student.provided_concession.reduce(
      (acc: number, cons: ConcessionStudentMaster) => {
        if (cons.amount) {
          return acc + Number(cons.amount)
        }
        return acc
      },
      0
    )

    let totalConcessionPercentageForStudent = student.provided_concession.reduce(
      (acc: number, cons: ConcessionStudentMaster) => {
        if (cons.percentage) {
          if (cons.concession.concessions_to === 'plan') {
            return acc + (Number(cons.percentage) * Number(feesPlan.total_amount)) / 100
          } else {
            const matchingDetail = feesDetails.find(
              (detail) => detail.fees_type_id === cons.fees_type_id
            )
            if (matchingDetail) {
              return acc + (Number(cons.percentage) * Number(matchingDetail.total_amount)) / 100
            }
            return acc
          }
        }
        return acc
      },
      0
    )

    let totalConcessionAmountForPlan = feesPlan.concession_for_plan.reduce(
      (acc: number, cons: ConcessionFeesPlanMaster) => {
        if (cons.amount) {
          return acc + Number(cons.amount)
        }
        return acc
      },
      0
    )
    let totalConcessionPercentageForPlan = feesPlan.concession_for_plan.reduce(
      (acc: number, cons: ConcessionFeesPlanMaster) => {
        if (cons.percentage) {
          if (cons.concession.concessions_to === 'plan') {
            return acc + (Number(cons.percentage) * Number(feesPlan.total_amount)) / 100
          } else {
            const matchingDetail = feesDetails.find(
              (detail) => detail.fees_type_id === cons.fees_type_id
            )
            if (matchingDetail) {
              return acc + (Number(cons.percentage) * Number(matchingDetail.total_amount)) / 100
            }
            return acc
          }
        }
        return acc
      },
      0
    )

    let totalConcessionForStudent =
      Number(totalConcessionAmountForStudent) + Number(totalConcessionPercentageForStudent)

    let totalConcessionForPlan =
      Number(totalConcessionAmountForPlan) + Number(totalConcessionPercentageForPlan)

    res.wallet.total_concession_for_student = totalConcessionForStudent
    res.wallet.total_concession_for_plan = totalConcessionForPlan

    let studentObj: any = { ...student.serialize() }

    if (!student.fees_status) {
      studentObj.fees_status = {
        student_id: student.id,
        academic_session_id: academicSession.id,
        fees_plan_id: feesPlan.id,
        discounted_amount: 0,
        paid_amount: 0,
        total_amount: feesPlan.total_amount,
        due_amount: feesPlan.total_amount,
        status: 'Pending',
      }
    } else {
      let paidFees = await StudentFeesInstallments.query().where(
        'student_fees_master_id',
        student.fees_status.id
      )
      res.paid_fees = paidFees
    }

    res.fees_plan = feesPlan
    res.fees_details = feesDetails

    // let usedConcession =
    //   res.paid_fees.length === 0
    //     ? 0
    //     : res.paid_fees.reduce((acc: number, installment: StudentFeesInstallments) => {
    //         return (
    //           acc + Number(installment.discounted_amount) + Number(installment.refunded_amount || 0)
    //         )
    //       }, 0)

    // // Adjust remaining unpaid installments with applied concessions
    // let remainingConcession = totalConcessionForStudent + totalConcessionForPlan - usedConcession
    // let remainingDueAmount = Number(studentObj.fees_status.due_amount)

    // for (let detail of res.fees_details) {
    //   for (let installment of detail.installments_breakdown) {
    //     if (installment.status === 'Active' && remainingDueAmount > 0) {
    //       let installmentAmount = Number(installment.installment_amount)
    //       let adjustedAmount = installmentAmount

    //       if (remainingConcession > 0) {
    //         if (remainingConcession >= installmentAmount) {
    //           adjustedAmount = 0
    //           remainingConcession -= installmentAmount
    //         } else {
    //           adjustedAmount -= remainingConcession
    //           remainingConcession = 0
    //         }
    //       }

    //       if (remainingDueAmount >= adjustedAmount) {
    //         remainingDueAmount -= adjustedAmount
    //       } else {
    //         adjustedAmount = remainingDueAmount
    //         remainingDueAmount = 0
    //       }

    //       installment.installment_amount = Number(adjustedAmount.toFixed(2))
    //     }
    //   }
    // }

    return ctx.response.json({ student: studentObj, detail: res })
  }

  async payMultipleInstallments(ctx: HttpContext) {
    const payload = await CreateValidationForMultipleInstallments.validate(ctx.request.body())

    let student_id = payload.student_id

    if (!student_id) {
      return ctx.response.status(400).json({
        message: 'Please provide student_id',
      })
    }

    let academicSession = await AcademicSession.query()
      .where('is_active', 1)
      .andWhere('school_id', ctx.auth.user!.school_id)
      .first()

    if (!academicSession) {
      return ctx.response.status(404).json({
        message: 'No active academic year found for this school',
      })
    }

    let student = await Students.query()
      .select('id', 'first_name', 'middle_name', 'last_name', 'gr_no', 'roll_number')
      .preload('fees_status')
      .preload('provided_concession', (query) => {
        query.preload('concession', (query) => {
          query.where('status', 'Active')
        })
        query.where('status', 'Active')
      })
      .preload('academic_class', (query) => {
        query.preload('division', (query) => {
          query.preload('class', (query) => {
            query.select('id', 'class').where('school_id', ctx.auth.user!.school_id)
          })
        })
        query.where('academic_session_id', academicSession.id)
      })
      .where('id', student_id)
      .andWhere('school_id', ctx.auth.user!.school_id)
      .first()

    if (!student) {
      return ctx.response.status(404).json({
        message: 'Student not found',
      })
    }

    let fees_plan = await FeesPlan.query()
      .where('division_id', student.academic_class[0].division_id)
      .andWhere('academic_session_id', academicSession.id)
      .andWhere('status', 'Active')
      .first()

    if (!fees_plan) {
      return ctx.response.status(404).json({
        message: 'No fees plan found for this student',
      })
    }

    let trx = await db.transaction()

    try {
      let total_payed_amount = payload.installlments.reduce(
        (acc: number, installment: any) => acc + Number(installment.paid_amount),
        0
      )

      let totoal_discount = payload.installlments.reduce(
        (acc: number, installment: any) => acc + Number(installment.discounted_amount),
        0
      )

      if (!student.fees_status) {
        let studentFeesMaster = await StudentFeesMaster.create(
          {
            student_id: student_id,
            fees_plan_id: fees_plan.id,
            academic_session_id: academicSession.id,
            discounted_amount: totoal_discount,
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

      for (let installment of payload.installlments) {
        let fees_installment = await InstallmentBreakDowns.query()
          .andWhere('id', installment.installment_id)
          .where('fee_plan_details_id', installment.fee_plan_details_id)
          .first()

        if (!fees_installment) {
          await trx.rollback()
          return ctx.response.status(404).json({
            message: `No installment found for installment number ${installment.installment_id}`,
          })
        }

        if (
          Number(fees_installment.installment_amount) !==
          Number(installment.paid_amount) + Number(installment.discounted_amount)
        ) {
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
    let academic_session_id = ctx.request.input('academic_session')
    let concession = await Concessions.query()
      .where('id', concession_id)
      .andWhere('academic_session_id', academic_session_id)
      .first()
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
      concession_holder_plans: ConcessionFeesPlanMaster[] | null
      concession_holder_students: ConcessionStudentMaster[] | null
    }

    let response_obj: res = {
      concession: concession,
      concession_holder_plans: null,
      concession_holder_students: null,
    }

    if (concession.applicable_to === 'plan') {
      let plans = await ConcessionFeesPlanMaster.query()
        .preload('fees_plan')
        .preload('fees_type')
        .where('concession_id', concession_id)

      response_obj.concession_holder_plans = plans
    }
    if (concession.applicable_to === 'students') {
      let students = await ConcessionStudentMaster.query()
        .preload('student', (query) => {
          query.preload('academic_class', (query) => {
            query.preload('division', (query) => {
              query.preload('class', (query) => {
                query.select('id', 'class').where('school_id', ctx.auth.user!.school_id)
              })
            })
          })
          query.select('id', 'first_name', 'middle_name', 'last_name', 'gr_no', 'roll_number')
        })
        .preload('fees_plan')
        .where('concession_id', concession_id)

      response_obj.concession_holder_students = students
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
        status: 'Active',
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

      let academic_session_id = await AcademicSession.query()
        .where('id', concession.academic_session_id)
        .andWhere('school_id', ctx.auth.user!.school_id)
        .first()

      if (!academic_session_id) {
        return ctx.response.status(404).json({
          message: 'No active academic year found for this school',
        })
      }

      if (!academic_session_id.is_active) {
        return ctx.response.status(400).json({
          message: 'Academic session is not active',
        })
      }

      if (payload.status && payload.status === 'Inactive') {
        if (concession.applicable_to === 'plan') {
          await ConcessionFeesPlanMaster.query()
            .where('concession_id', concession_id)
            .update({ status: 'Inactive' })
        }
        if (concession.applicable_to === 'students') {
          await ConcessionStudentMaster.query()
            .where('concession_id', concession_id)
            .update({ status: 'Inactive' })
        }
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

      let fees_plan = await FeesPlan.query().where('id', payload.fees_plan_id).first()

      if (!fees_plan) {
        return ctx.response.status(404).json({
          message: 'Fees Plan not found',
        })
      }

      let acadamic_session = await AcademicSession.query()
        .where('id', fees_plan.academic_session_id)
        .andWhere('school_id', ctx.auth.user!.school_id)
        .first()

      if (!acadamic_session) {
        return ctx.response.status(404).json({
          message: 'Academic session not found',
        })
      }

      if (!acadamic_session.is_active) {
        return ctx.response.status(400).json({
          message: 'Academic session is not active',
        })
      }

      let concssion = await Concessions.query()
        .where('id', payload.concession_id)
        .andWhere('academic_session_id', acadamic_session.id)
        .andWhere('school_id', ctx.auth.user!.school_id)
        .andWhere('status', 'Active')
        .first()

      if (!concssion) {
        return ctx.response.status(404).json({
          message: 'Concession not found',
        })
      }

      if (concssion.applicable_to !== 'plan') {
        return ctx.response.status(400).json({
          message: 'Concession is not applicable to plan',
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

      let trx = await db.transaction()
      let { fees_type_ids, ...payload_without_fees_type } = payload

      try {
        if (concssion.concessions_to === 'plan') {
          if (payload.fees_type_ids) {
            return ctx.response.status(400).json({
              message: 'fees_ids field should be null for this concession',
            })
          }
          await ConcessionFeesPlanMaster.create(
            {
              ...payload_without_fees_type,
              fees_type_id: null,
              academic_session_id: acadamic_session.id,
            },
            { client: trx }
          )
        } else {
          if (!fees_type_ids) {
            return ctx.response.status(400).json({
              message: 'fees_ids field is required for this concession',
            })
          }
          if (fees_type_ids.length === 0) {
            return ctx.response.status(400).json({
              message: 'fees_ids field is required for this concession',
            })
          }

          for (let i = 0; i < fees_type_ids.length; i++) {
            let fees_type = await FeesType.query()
              .where('id', fees_type_ids[i])
              .andWhere('academic_session_id', acadamic_session.id)
              .andWhere('school_id', ctx.auth.user!.school_id)
              .first()

            if (!fees_type) {
              return ctx.response.status(404).json({
                message: `${fees_type_ids[i]} - fees type not found`,
              })
            }

            await ConcessionFeesPlanMaster.create(
              {
                ...payload_without_fees_type,
                fees_type_id: fees_type.id,
                academic_session_id: acadamic_session.id,
              },
              { client: trx }
            )
          }
        }
        await trx.commit()
        return ctx.response.status(201).json({
          message: 'Concession applied to plan successfully',
        })
      } catch (error) {
        await trx.rollback()
        return ctx.response.status(500).json({
          message: 'Internal Server Error',
          error: error,
        })
      }
    } else {
      return ctx.response.status(401).json({
        message: 'You are not authorized to perform this action !',
      })
    }
  }

  async updateAppliedConcessionToPlan(ctx: HttpContext) {
    let concession_id = ctx.params.concession_id
    let plan_id = ctx.params.plan_id

    if (ctx.auth.user!.role_id == 1 || ctx.auth.user!.role_id == 2) {
      const payload = await UpdateValidationForAppliedConcessionToPlan.validate(ctx.request.body())

      let concession_applied_to_plan = await ConcessionFeesPlanMaster.query()
        .preload('concession')
        .where('fees_plan_id', plan_id)
        .andWhere('concession_id', concession_id)
        .first()

      if (!concession_applied_to_plan) {
        return ctx.response.status(404).json({
          message: 'Concession not found',
        })
      }

      let academic_session_id = await AcademicSession.query()
        .where('id', concession_applied_to_plan.academic_session_id)
        .andWhere('school_id', ctx.auth.user!.school_id)
        .andWhere('is_active', 1)
        .first()

      if (!academic_session_id) {
        return ctx.response.status(404).json({
          message: 'No active academic year found for this school',
        })
      }

      if (!academic_session_id.is_active) {
        return ctx.response.status(400).json({
          message: 'Academic session is not active',
        })
      }

      if (payload.deduction_type) {
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

        if (payload.amount && payload.amount > concession_applied_to_plan.fees_plan.total_amount) {
          return ctx.response.status(400).json({
            message: 'Concession amount cannot be greater than total fees amount',
          })
        }
      }

      let trx = await db.transaction()

      try {
        if (
          payload.status === 'Active' &&
          concession_applied_to_plan.concession.status === 'Inactive'
        ) {
          await trx.rollback()
          return ctx.response.status(400).json({
            message: 'Concession Plan is not active , You can not modify this plan',
          })
        }
        ;(await concession_applied_to_plan.merge(payload).save()).useTransaction(trx)
        await trx.commit()
        return ctx.response.status(201).json({
          message: 'Concession applied to plan successfully',
        })
      } catch (error) {
        await trx.rollback()
        return ctx.response.status(500).json({
          message: 'Internal Server Error',
          error: error,
        })
      }
    } else {
      return ctx.response.status(401).json({
        message: 'You are not authorized to perform this action !',
      })
    }
  }

  async applyConcessionToStudent(ctx: HttpContext) {
    if (ctx.auth.user!.role_id == 1 || ctx.auth.user!.role_id == 2) {
      const payload = await CreateValidationForApplyConcessionToStudent.validate(ctx.request.body())

      let fees_plan = await FeesPlan.query().where('id', payload.fees_plan_id).first()

      if (!fees_plan) {
        return ctx.response.status(404).json({
          message: 'Fees Plan not found',
        })
      }

      let acadamic_session = await AcademicSession.query()
        .where('id', fees_plan.academic_session_id)
        .andWhere('school_id', ctx.auth.user!.school_id)
        .first()

      if (!acadamic_session) {
        return ctx.response.status(404).json({
          message: 'Academic session not found',
        })
      }

      if (!acadamic_session.is_active) {
        return ctx.response.status(400).json({
          message: 'Academic session is not active',
        })
      }

      let studentEnrollment = await StudentEnrollments.query()
        .where('student_id', payload.student_id)
        .where('academic_session_id', acadamic_session.id)
        .first()

      if (!studentEnrollment) {
        return ctx.response.status(404).json({
          message: 'Student not found for this academic session',
        })
      }

      let concssion = await Concessions.query()
        .where('id', payload.concession_id)
        .andWhere('academic_session_id', acadamic_session.id)
        .andWhere('school_id', ctx.auth.user!.school_id)
        .andWhere('status', 'Active')
        .first()

      if (!concssion) {
        return ctx.response.status(404).json({
          message: 'Concession not found',
        })
      }

      if (concssion.applicable_to !== 'students') {
        return ctx.response.status(400).json({
          message: 'Concession is not applicable to Student',
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

      let { fees_type_ids, ...payload_without_fees_type } = payload

      let trx = await db.transaction()

      try {
        if (concssion.concessions_to === 'plan') {
          if (payload.fees_type_ids) {
            return ctx.response.status(400).json({
              message: 'fees_ids field should be null for this concession',
            })
          }
          await ConcessionStudentMaster.create(
            {
              ...payload_without_fees_type,
              fees_type_id: null,
              academic_session_id: acadamic_session.id,
            },
            { client: trx }
          )
        } else {
          if (!fees_type_ids) {
            return ctx.response.status(400).json({
              message: 'fees_ids field is required for this concession',
            })
          }
          if (fees_type_ids.length === 0) {
            return ctx.response.status(400).json({
              message: 'fees_ids field is required for this concession',
            })
          }

          for (let i = 0; i < fees_type_ids.length; i++) {
            let fees_type = await FeesType.query()
              .where('id', fees_type_ids[i])
              .andWhere('academic_session_id', acadamic_session.id)
              .andWhere('school_id', ctx.auth.user!.school_id)
              .first()

            if (!fees_type) {
              return ctx.response.status(404).json({
                message: `${fees_type_ids[i]} - fees type not found`,
              })
            }

            await ConcessionStudentMaster.create(
              {
                ...payload_without_fees_type,
                fees_type_id: fees_type.id,
                academic_session_id: acadamic_session.id,
              },
              { client: trx }
            )
          }
        }
        await trx.commit()
        return ctx.response.status(201).json({
          message: 'Concession applied to plan successfully',
        })
      } catch (error) {
        console.log('error', error)
        await trx.rollback()
        return ctx.response.status(500).json({
          message: 'Internal Server Error',
          error: error,
        })
      }
    } else {
      return ctx.response.status(401).json({
        message: 'You are not authorized to perform this action !',
      })
    }
  }

  async updateConcessionAppliedToStudent(ctx: HttpContext) {
    let concession_id = ctx.params.concession_id
    let student_id = ctx.params.student_id
    let plan_id = ctx.params.plan_id

    if (ctx.auth.user!.role_id == 1 || ctx.auth.user!.role_id == 2) {
      const payload = await UpdateValidationForAppliedConcessionToStudent.validate(
        ctx.request.body()
      )

      let concession_applied_to_student = await ConcessionStudentMaster.query()
        .preload('concession')
        .where('student_id', student_id)
        .andWhere('concession_id', concession_id)
        .andWhere('fees_plan_id', plan_id)
        .first()

      if (!concession_applied_to_student) {
        return ctx.response.status(404).json({
          message: 'Concession not found',
        })
      }

      let academic_session_id = await AcademicSession.query()
        .where('id', concession_applied_to_student.academic_session_id)
        .andWhere('school_id', ctx.auth.user!.school_id)
        .andWhere('is_active', 1)
        .first()

      if (!academic_session_id) {
        return ctx.response.status(404).json({
          message: 'No active academic year found for this school',
        })
      }

      if (!academic_session_id.is_active) {
        return ctx.response.status(400).json({
          message: 'Academic session is not active',
        })
      }

      if (payload.deduction_type) {
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

        if (
          payload.amount &&
          payload.amount > concession_applied_to_student.fees_plan.total_amount
        ) {
          return ctx.response.status(400).json({
            message: 'Concession amount cannot be greater than total fees amount',
          })
        }
      }

      let trx = await db.transaction()

      try {
        if (
          payload.status === 'Active' &&
          concession_applied_to_student.concession.status === 'Inactive'
        ) {
          await trx.rollback()
          return ctx.response.status(400).json({
            message: 'Concession Plan is not active , You can not modify this plan',
          })
        }
        ;(await concession_applied_to_student.merge(payload).save()).useTransaction(trx)
        await trx.commit()
        return ctx.response.status(201).json({
          message: 'Concession applied to plan successfully',
        })
      } catch (error) {
        await trx.rollback()
        return ctx.response.status(500).json({
          message: 'Internal Server Error',
          error: error,
        })
      }
    } else {
      return ctx.response.status(401).json({
        message: 'You are not authorized to perform this action !',
      })
    }
  }
}
