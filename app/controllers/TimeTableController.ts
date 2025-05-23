import AcademicSession from '#models/AcademicSession'
import ClassDayConfig from '#models/ClassDayConfig'
import Classes from '#models/Classes'
import Divisions from '#models/Divisions'
import LabConfig from '#models/LabConfig'
import PeriodsConfig from '#models/PeriodsConfig'
import SchoolTimeTableConfig from '#models/SchoolTimeTableConfig'
import { CreateValidatorForClassDayConfig, CreateValidatorForLabConfig, CreateValidatorForPeriodConfig, CreateValidatorForSchoolTimeTableConfig, ValidatorForCheckPeriodConfig } from '#validators/TimeTable'
import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import { BlobOptions } from 'buffer'

interface TypeForPeriodsConfig {
  class_day_config_id: number;
  division_id: number;
  period_order: number;
  start_time: string;
  end_time: string;
  is_break: boolean;
  subjects_division_masters_id: number | null;
  staff_enrollment_id: number | null;
  lab_id: number | null;
  is_pt: boolean;
  is_free_period: boolean;
}


export default class TimeTableController {

  async getSchoolTimeTableConfig(ctx: HttpContext) {

    let academic_session_id = ctx.params.academic_session_id;

    let academic_session = await AcademicSession
      .query()
      .where('id', academic_session_id)
      .andWhere('school_id', ctx.auth.user!.school_id)
      .first()

    if (!academic_session) {
      return ctx.response.badRequest({ message: 'Academic session not found' })
    }

    let school_timetable_config = await SchoolTimeTableConfig
      .query()
      .preload('lab_config')
      .preload('class_day_config')
      .where('academic_session_id', academic_session_id)
      .first()

    if (!school_timetable_config) {
      return ctx.response.notFound({ message: 'School Time Table Config not found' })
    }

    return ctx.response.json(school_timetable_config)
  }

  async createSchoolTimeTableConfig(ctx: HttpContext) {

    let payload = await CreateValidatorForSchoolTimeTableConfig.validate(ctx.request.all())

    let academic_session = await AcademicSession
      .query()
      .where('id', payload.academic_session_id)
      .andWhere('school_id', ctx.auth.user!.school_id)
      .first()

    if (!academic_session) {
      return ctx.response.badRequest({ message: 'Academic session not found' })
    }

    if (!academic_session.is_active) {
      return ctx.response.badRequest({ message: 'Academic session is not active' })
    }
    try {
      // payload.allowed_period_durations = JSON.stringify(payload.allowed_period_durations)
      let school_timetable_config = await SchoolTimeTableConfig.create({
        academic_session_id: payload.academic_session_id,
        max_periods_per_day: payload.max_periods_per_day,
        default_period_duration: payload.default_period_duration,
        allowed_period_durations: JSON.stringify(payload.allowed_period_durations),
        lab_enabled: payload.lab_enabled,
        pt_enabled: payload.pt_enabled,
        period_gap_duration: payload.period_gap_duration,
        teacher_max_periods_per_day: payload.teacher_max_periods_per_day,
        teacher_max_periods_per_week: payload.teacher_max_periods_per_week,
        is_lab_included_in_max_periods: payload.is_lab_included_in_max_periods

      }, {
        // client: trx
      });
      return ctx.response.status(201).json(school_timetable_config)
    } catch (error) {
      console.log(error)
      return ctx.response.badRequest({ message: 'Error creating school time table config' })
    }


  }

  async createLabConfig(ctx: HttpContext) {
    let { school_timetable_config_id, ...payload } = await CreateValidatorForLabConfig.validate(ctx.request.all())

    let school_timetable_config = await SchoolTimeTableConfig
      .query()
      .where('id', school_timetable_config_id)
      .first()

    if (!school_timetable_config) {
      return ctx.response.badRequest({ message: 'School Time Table Config not found' })
    }

    let academic_session = await AcademicSession
      .query()
      .where('id', school_timetable_config.academic_session_id)
      .andWhere('school_id', ctx.auth.user!.school_id)
      .first()

    if (!academic_session) {
      return ctx.response.badRequest({ message: 'Academic session not found for this School Time table configuration' })
    }

    if (!academic_session.is_active) {
      return ctx.response.badRequest({ message: 'Academic session is not active' })
    }
    let trx = await db.transaction()
    try {
      let res: LabConfig[] = []
      for (let i = 0; i < payload.labs.length; i++) {
        let lab = payload.labs[i]
        let checl_lab_config = await LabConfig.query().where('school_timetable_config_id', school_timetable_config_id).andWhere('name', lab.name).first()
        if (checl_lab_config) {
          return ctx.response.badRequest({ message: `Lab with name ${lab.name} already exists` })
        }
        let lab_config = await LabConfig.create({ ...lab, school_timetable_config_id, type: 'other' }, { client: trx });
        res.push(lab_config)
      }
      await trx.commit()
      return ctx.response.status(201).json(res)
    } catch (error) {
      await trx.rollback()
      console.log(error)
      return ctx.response.badRequest({ message: 'Error creating lab config' })
    }

  }


  async createClassDayConfig(ctx: HttpContext) {
    let payload = await CreateValidatorForClassDayConfig.validate(ctx.request.all())

    let school_timetable_config = await SchoolTimeTableConfig
      .query()
      .where('id', payload.school_timetable_config_id)
      .first()

    if (!school_timetable_config) {
      return ctx.response.badRequest({ message: 'School Time Table Config not found' })
    }

    let academic_session = await AcademicSession
      .query()
      .where('id', school_timetable_config.academic_session_id)
      .andWhere('school_id', ctx.auth.user!.school_id)
      .first()

    if (!academic_session) {
      return ctx.response.badRequest({ message: 'Academic session not found for this School Time table configuration' })
    }

    if (!academic_session.is_active) {
      return ctx.response.badRequest({ message: 'Academic session is not active' })
    }

    try {
      let class_day_config = await ClassDayConfig.create({
        school_timetable_config_id: payload.school_timetable_config_id,
        class_id: payload.class_id,
        day: payload.day,
        allowed_durations: JSON.stringify(payload.allowed_durations),
        max_consecutive_periods: payload.max_consecutive_periods,
        total_breaks: payload.total_breaks,
        break_durations: JSON.stringify(payload.break_durations),
        day_start_time: payload.day_start_time,
        day_end_time: payload.day_end_time
      })
      return ctx.response.status(201).json(class_day_config)
    } catch (error) {
      console.log(error)
      return ctx.response.badRequest({ message: 'Error creating class day config' })
    }
  }

  async fetchTimeTableForDivision(ctx: HttpContext) {
    let { division_id } = ctx.params
    let academic_session_id = ctx.request.input('academic_session');

    let academic_session = await AcademicSession
      .query()
      .where('id', academic_session_id)
      .andWhere('school_id', ctx.auth.user!.school_id)
      .first()

    if (!academic_session) {
      return ctx.response.badRequest({ message: 'Academic session not found' })
    }

    let division = await Divisions.query().where('id', division_id).first();
    if (!division) {
      return ctx.response.badRequest({ message: 'Division not found' })
    }

    let cls = await Classes.query().where('id', division.class_id).andWhere('school_id', ctx.auth.user!.school_id).first();

    if (!cls) {
      return ctx.response.badRequest({ message: 'Class not found for provided Division' })
    }

    let school_timetable_config = await SchoolTimeTableConfig
      .query()
      .preload('lab_config')
      .preload('class_day_config', (class_query) => {
        class_query.preload('period_config', (query) => {
          query.where('division_id', division_id)
          // Remove the incorrect string comparison; the relationship should already filter by class_day_config_id
        })
        class_query.where('class_id', cls.id)
      })
      .first()

    if (!school_timetable_config) {
      return ctx.response.notFound({ message: 'School Time Table Config not found for class associated with division' })
    }

    return ctx.response.json(school_timetable_config)
  }

  async createTimeTableForDivisionForADay(ctx: HttpContext) {
    let { division_id, class_day_config_id, periods } = await CreateValidatorForPeriodConfig.validate(ctx.request.all());

    // check if class_day_config_id is valid
    let class_day_config = await ClassDayConfig
      .query()
      .where('id', class_day_config_id)
      .first()

    if (!class_day_config) {
      return ctx.response.badRequest({ message: 'Class Day Config not found' })
    }

    // check school_timetable_config_id 
    let school_timetable_config = await SchoolTimeTableConfig
      .query()
      .where('id', class_day_config.school_timetable_config_id)
      .first()

    if (!school_timetable_config) {
      return ctx.response.badRequest({ message: 'School Time Table Config not found' })
    }

    let academic_session = await AcademicSession
      .query()
      .where('id', school_timetable_config.academic_session_id)
      .andWhere('school_id', ctx.auth.user!.school_id)
      .first()

    if (!academic_session) {
      return ctx.response.badRequest({ message: 'Academic session not found for this School Time table configuration' })
    }
    if (!academic_session.is_active) {
      return ctx.response.badRequest({ message: 'Academic session is not active' })
    }

    // check if division_id is valid
    let division = await Divisions.query().where('id', division_id).first();
    if (!division) {
      return ctx.response.badRequest({ message: 'Division not found' })
    }

    if (division.class_id != class_day_config.class_id) {
      return ctx.response.badRequest({ message: 'Class id in class day config does not match with division class id' })
    }

    let trx = await db.transaction()
    let res: PeriodsConfig[] = []
    try {
      for (let i = 0; i < periods.length; i++) {
        let period = periods[i]
        let check_period_config = await PeriodsConfig.query().where('id', class_day_config_id).first()
        if (check_period_config) {
          return ctx.response.badRequest({ message: `Periods for day ${class_day_config.day} already exists configured` })
        }

        let period_config = await PeriodsConfig.create({
          class_day_config_id: class_day_config_id,
          division_id: division_id,
          period_order: period.period_order,
          start_time: period.start_time,
          end_time: period.end_time,
          is_break: period.is_break,
          subjects_division_masters_id: period.subjects_division_masters_id,
          staff_enrollment_id: period.staff_enrollment_id,
          lab_id: period.lab_id,
          is_pt: period.is_pt,
          is_free_period: period.is_free_period
        }, { client: trx })
        res.push(period_config)
      }
      await trx.commit()
      return ctx.response.status(201).json(res)
    } catch (error) {
      await trx.rollback()
      console.log(error)
      return ctx.response.badRequest({ message: 'Error creating class day config' })
    }
  }

  async checkAvailabilityForConfiguredPeriod(ctx: HttpContext) {
    /**
     * 
     * we need to check for , 
     * 1 . avability of teacher for perticular time  (Check),
     * 2 . Constant occurance of same subject in a week , and per day 
     * 3 . lab availability (Check)
     * 4 . if the period is free , validate , can not have more then 2 free periods in a day
     * 5 . if the period is break , validate , can not have more then 2 breaks in a day
     * 6 . if the period is pt , validate , can not have more then 2 pt in a day
     * 7.  validation for teacher , techer should not have more then 5 periods in a
     *  day , and should not hae more then 16 periods in a week
     *  
     * 
     *  */

    let payload = await ValidatorForCheckPeriodConfig.validate(ctx.request.all());

    // check if class_day_config_id is valid
    let class_day_config = await ClassDayConfig
      .query()
      .where('id', payload.class_day_config_id)
      .first()
    if (!class_day_config) {
      return ctx.response.badRequest({ message: 'Class Day Config not found' })
    }
    // check school_timetable_config_id
    let school_timetable_config = await SchoolTimeTableConfig
      .query()
      .where('id', class_day_config.school_timetable_config_id)
      .first()
    if (!school_timetable_config) {
      return ctx.response.badRequest({ message: 'School Time Table Config not found' })
    }

    // Now check if the teacher is available for this period
    let result = await this.checkTeacherAvailability(payload, class_day_config, school_timetable_config)
    if (result.result === false) {
      return ctx.response.badRequest({
        code: result.status,
        message: result.message
      })
    }
    // 2 . Constant occurance of same subject in a week , and per day

    // 3 . lab availability
    if (payload.lab_id) {
      let lab_result = await this.checklabAvailability(payload, class_day_config, school_timetable_config)
      if (lab_result.result === false) {
        return ctx.response.badRequest({
          code: lab_result.status,
          message: lab_result.message
        })
      }
    }

    return ctx.response.status(200).json({ message: 'Teacher is available for this period' })

  }

  /*
   * check whether the teacher is already assigned to another period in the same time slot.
     check total number of periods assigned to the teacher in a day and week. 
   * 
   */
  private async checkTeacherAvailability(
    period_config: TypeForPeriodsConfig,
    class_day_config: ClassDayConfig,
    school_timetable_config: SchoolTimeTableConfig,
  ): Promise<{ result: boolean, status: string, message: string }> {
    // Fetch all periods for this teacher on the same day

    let check_class_day_config = await ClassDayConfig.query()
      .where('id', period_config.class_day_config_id)
      .first();

    let fetch_day_config_for_same_day = await ClassDayConfig.query()
      .where('school_timetable_config_id', class_day_config.school_timetable_config_id)
      .andWhere('day', check_class_day_config!.day);

    const periods = await PeriodsConfig.query()
      .where('staff_enrollment_id', period_config.staff_enrollment_id!)
      .whereIn('class_day_config_id', [...fetch_day_config_for_same_day.map((c) => c.id)])
      .whereNotNull('start_time')
      .whereNotNull('end_time')



    // 1. Check for time overlap (even 1 min is not allowed)
    const newStart = this.timeToMinutes(period_config.start_time);
    const newEnd = this.timeToMinutes(period_config.end_time);
    for (const period of periods) {
      const existingStart = this.timeToMinutes(period.start_time);
      const existingEnd = this.timeToMinutes(period.end_time);
      // console.log('existingStart', existingStart , existingEnd ,newStart < existingEnd , newEnd > existingStart)
      if ((newStart === existingEnd && newEnd === existingStart) || (newStart < existingEnd && newEnd > existingStart) || (newStart > existingStart && newEnd < existingEnd)) {
        return {
          result: false,
          status: 'TEACHER_NOT_AVAILABLE',
          message: 'Teacher is not available in this time slot (overlap with another period).'
        }
        // return ctx.response.badRequest({
        //   code: 'TEACHER_NOT_AVAILABLE',
        //   message: 'Teacher is not available in this time slot (overlap with another period).'
        // });
      }
    }

    // 2. Check for max periods per day
    const maxPerDay = school_timetable_config.teacher_max_periods_per_day || 5;
    if (periods.length >= maxPerDay) {
      return {
        result: false,
        status: 'PERIODS_LIMIT_FOR_TEACHER_EXCEEDED_FOR_DAY',
        message: `Teacher cannot have more than ${maxPerDay} periods in a day.`
      }
      // return ctx.response.badRequest({
      //   code: 'PERIODS_LIMIT_FOR_TEACHER_EXCEEDED_FOR_DAY',
      //   message: `Teacher cannot have more than ${maxPerDay} periods in a day.`
      // });
      // return false;
    }

    // 3. Check for max periods per week
    // Find all class_day_config_ids for the same week (same class, same academic session, same school timetable config)
    const allClassDayConfigs = await ClassDayConfig.query()
      .where('school_timetable_config_id', class_day_config.school_timetable_config_id)
      .andWhere('class_id', class_day_config.class_id)
      .select('id');
    const classDayConfigIds = allClassDayConfigs.map(c => c.id);
    const periodsForWeek = await PeriodsConfig.query()
      .where('staff_enrollment_id', period_config.staff_enrollment_id!)
      .whereIn('class_day_config_id', classDayConfigIds)
      .count('* as total');
    const maxPerWeek = school_timetable_config.teacher_max_periods_per_week || 16;
    if (Number(periodsForWeek[0].$extras.total) >= maxPerWeek) {
      return {
        result: false,
        status: 'PERIODS_LIMIT_FOR_TEACHER_EXCEEDED_FOR_WEEK',
        message: `Teacher cannot have more than ${maxPerWeek} periods in a week.`
      }
      // return ctx.response.badRequest({
      //   code: 'PERIODS_LIMIT_FOR_TEACHER_EXCEEDED_FOR_WEEK',
      //   message: `Teacher cannot have more than ${maxPerWeek} periods in a week.`
      // });
      // return false;
    }

    return {
      result: true,
      status: 'TEACHER_AVAILABLE',
      message: 'Teacher is available for this period.'
    };
  }

  private async checklabAvailability(period_config: TypeForPeriodsConfig,
    class_day_config: ClassDayConfig,
    school_timetable_config: SchoolTimeTableConfig)
    : Promise<{ result: boolean, status: string, message: string }> {

    // Fetch all periods for this lab on the same day
    let check_class_day_config = await ClassDayConfig.query()
      .where('id', period_config.class_day_config_id)
      .first();

    let fetch_day_config_for_same_day = await ClassDayConfig.query()
      .where('school_timetable_config_id', school_timetable_config.id)
      .andWhere('day', check_class_day_config!.day);

    let lab_config = await LabConfig.query()
      .where('id', period_config.lab_id!)
      .andWhere('school_timetable_config_id', class_day_config.school_timetable_config_id)
      .first();

    if (!lab_config) {
      return {
        result: false,
        status: 'LAB_NOT_AVAILABLE',
        message: 'Lab not found for this period.'
      }
    }

    const periods = await PeriodsConfig.query()
      .where('lab_id', period_config.lab_id!)
      .whereIn('class_day_config_id', [...fetch_day_config_for_same_day.map((c) => c.id)])
      .whereNotNull('start_time')
      .whereNotNull('end_time')

    // 1. Check for time overlap (even 1 min is not allowed)
    const newStart = this.timeToMinutes(period_config.start_time);
    const newEnd = this.timeToMinutes(period_config.end_time);

    let used_capcity = 0;
    for (const period of periods) {
      const existingStart = this.timeToMinutes(period.start_time);
      const existingEnd = this.timeToMinutes(period.end_time);
      if ((newStart === existingEnd && newEnd === existingStart) || (newStart < existingEnd && newEnd > existingStart) || (newStart > existingStart && newEnd < existingEnd)) {
        used_capcity += 1;
        // return {
        //   result: false,
        //   status: 'LAB_NOT_AVAILABLE',
        //   message: 'Lab is not available in this time slot (overlap with another period).'
        // }
      }
    }
    if (lab_config.max_capacity === null || used_capcity >= lab_config!.max_capacity) {
      return {
        result: false,
        status: 'LAB_NOT_AVAILABLE',
        message: `Lab is not available in this time slot (overlap with another period) , In use by ${used_capcity} classes.`
      }
    }

    if (lab_config.availability_per_day === null || used_capcity >= lab_config!.availability_per_day) {
      return {
        result: false,
        status: 'LAB_NOT_AVAILABLE',
        message: `Lab is not available. Exceeded daily availability ${used_capcity} . `
      }

    }

    return {
      result: true,
      status: 'LAB_AVAILABLE',
      message: 'Lab is available for this period.'
    }

  }

  // Helper to convert HH:mm string to minutes
  private timeToMinutes(time: string): number {
    const [h, m] = time.split(':').map(Number);
    return h * 60 + m;
  }
}



