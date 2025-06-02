import AcademicSession from '#models/AcademicSession'
import ClassDayConfig from '#models/ClassDayConfig'
import Classes from '#models/Classes'
import Divisions from '#models/Divisions'
import LabConfig from '#models/LabConfig'
import PeriodsConfig from '#models/PeriodsConfig'
import SchoolTimeTableConfig from '#models/SchoolTimeTableConfig'
import { CreateValidatorForClassDayConfig, CreateValidatorForLabConfig, CreateValidatorForPeriodConfig, CreateValidatorForSchoolTimeTableConfig, UpdateValidatorForClassDayConfig, UpdateValidatorForLabConfig, UpdateValidatorForPeriodConfig, UpdateValidatorForSchoolTimeTableConfig, ValidatorForCheckPeriodConfig } from '#validators/TimeTable'
import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import SubjectDivisionMaster from '#models/SubjectDivisionMaster'

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

  async updateSchoolTimeTableConfig(ctx: HttpContext) {
    const { academic_session_id } = ctx.request.all();
    const payload = await UpdateValidatorForSchoolTimeTableConfig.validate(ctx.request.all());

    if (!academic_session_id) {
      return ctx.response.badRequest({ message: 'academic_session_id is required' });
    }

    const school_timetable_config = await SchoolTimeTableConfig
      .query()
      .where('academic_session_id', academic_session_id)
      .first();

    if (!school_timetable_config) {
      return ctx.response.notFound({ message: 'School Time Table Config not found' });
    }

    // Check if any day configs exist for this timetable config
    const existingDayConfigs = await ClassDayConfig
      .query()
      .where('school_timetable_config_id', school_timetable_config.id);

    // Only check if field exists in payload and day configs exist
    if (
      payload.max_periods_per_day !== undefined &&
      existingDayConfigs.length > 0 &&
      payload.max_periods_per_day < school_timetable_config.max_periods_per_day
    ) {
      return ctx.response.badRequest({
        message: 'Cannot reduce max_periods_per_day because day configs exist. Please delete all day configs before making this change.'
      });
    }

    if (
      payload.allowed_period_durations !== undefined &&
      existingDayConfigs.length > 0
    ) {
      return ctx.response.badRequest({
        message: 'Cannot update allowed_period_durations because day configs exist. Please delete all day configs before making this change.'
      });
    }

    if (
      payload.lab_enabled !== undefined &&
      existingDayConfigs.length > 0
    ) {
      return ctx.response.badRequest({
        message: 'Cannot update lab_enabled because day configs exist. Please delete all day configs before making this change.'
      });
    }

    if (
      payload.pt_enabled !== undefined &&
      existingDayConfigs.length > 0
    ) {
      return ctx.response.badRequest({
        message: 'Cannot update pt_enabled because day configs exist. Please delete all day configs before making this change.'
      });
    }

    if (
      payload.period_gap_duration !== undefined &&
      existingDayConfigs.length > 0
    ) {
      return ctx.response.badRequest({
        message: 'Cannot update period_gap_duration because day configs exist. Please delete all day configs before making this change.'
      });
    }

    // Update the config
    school_timetable_config.merge({ ...payload, allowed_period_durations: JSON.stringify(payload.allowed_period_durations) });
    await school_timetable_config.save();

    return ctx.response.ok(school_timetable_config);
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

  async updateLabConfig(ctx: HttpContext) {
    const { lab_id } = ctx.request.all();
    const payload = await UpdateValidatorForLabConfig.validate(ctx.request.all());

    if (!lab_id) {
      return ctx.response.badRequest({ message: 'lab_id is required' });
    }

    const labConfig = await LabConfig.query().where('id', lab_id).first();
    if (!labConfig) {
      return ctx.response.notFound({ message: 'Lab config not found' });
    }

    // If reducing max_capacity, check for conflicts
    if (
      payload.max_capacity &&
      payload.max_capacity < labConfig.max_capacity
    ) {
      // Find all periods for this lab, grouped by day and time slot
      const periods = await PeriodsConfig.query()
        .where('lab_id', lab_id)
        .select('class_day_config_id', 'start_time', 'end_time');

      // Group by day and time slot
      const slotMap: Record<string, number> = {};
      for (const period of periods) {
        const key = `${period.class_day_config_id}_${period.start_time}_${period.end_time}`;
        slotMap[key] = (slotMap[key] || 0) + 1;
      }

      // If any slot exceeds the new max_capacity, block update
      const exceeds = Object.values(slotMap).some((count) => count > payload.max_capacity!);
      if (exceeds) {
        return ctx.response.badRequest({
          message:
            'Cannot reduce max_capacity. There are already more periods scheduled concurrently than the new capacity allows. Please update or delete conflicting periods first.',
        });
      }
    }

    labConfig.merge(payload);
    await labConfig.save();

    return ctx.response.ok(labConfig);
  }

  async deleteLabConfig(ctx: HttpContext) {
    const { lab_id } = ctx.request.all();

    if (!lab_id) {
      return ctx.response.badRequest({ message: 'lab_id is required' });
    }

    const labConfig = await LabConfig.query().where('id', lab_id).first();
    if (!labConfig) {
      return ctx.response.notFound({ message: 'Lab config not found' });
    }

    // Check if there are any periods assigned to this lab
    const periods = await PeriodsConfig.query().where('lab_id', lab_id).first();
    if (periods) {
      return ctx.response.badRequest({ message: 'Cannot delete lab config. There are periods assigned to this lab.' });
    }

    await labConfig.delete();

    return ctx.response.ok({ message: 'Lab config deleted successfully' });
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

  async updateClassDayConfig(ctx: HttpContext) {
    const { class_day_config_id } = ctx.request.all();
    const payload = await UpdateValidatorForClassDayConfig.validate(ctx.request.all());

    if (!class_day_config_id) {
      return ctx.response.badRequest({ message: 'class_day_config_id is required' });
    }

    const classDayConfig = await ClassDayConfig.query().where('id', class_day_config_id).first();
    if (!classDayConfig) {
      return ctx.response.notFound({ message: 'Class Day Config not found' });
    }

    // Check if any periods exist for this class_day_config (i.e., timetable already created for any division)
    const existingPeriods = await PeriodsConfig.query()
      .where('class_day_config_id', class_day_config_id)
      .first();

    // If critical fields are being changed and periods exist, block update
    if (
      existingPeriods &&
      (
        payload.allowed_durations !== undefined ||
        payload.max_consecutive_periods !== undefined ||
        payload.day_start_time !== undefined ||
        payload.day_end_time !== undefined
      )
    ) {
      return ctx.response.badRequest({
        message: 'Cannot update allowed_durations, max_consecutive_periods, day_start_time, or day_end_time because timetable already exists for this day. Please delete all periods for this day before making this change.'
      });
    }

    // Update the config
    classDayConfig.merge({
      ...payload,
      allowed_durations: payload.allowed_durations ? JSON.stringify(payload.allowed_durations) : classDayConfig.allowed_durations,
      break_durations: payload.break_durations ? JSON.stringify(payload.break_durations) : classDayConfig.break_durations,
    });
    await classDayConfig.save();

    return ctx.response.ok(classDayConfig);
  }

  async deleteClassCoonfigForWeek(ctx: HttpContext) {

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
        let check_period_config = await PeriodsConfig
          .query()
          .where('class_day_config_id', class_day_config_id)
          .andWhere('division_id', division_id)
          .first()
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

  async updateTimeTableForDivisionForADay(ctx: HttpContext) {
    let { division_id, class_day_config_id, periods } = await UpdateValidatorForPeriodConfig.validate(ctx.request.all());

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
        let check_period_config = await PeriodsConfig
          .query()
          .where('id', period.id)
          .andWhere('division_id', division_id)
          .andWhere('class_day_config_id' , class_day_config_id)
          .first()

        if (!check_period_config) {
          return ctx.response.badRequest({ message: `Periods for id ${period.id} does not exists !` })
        }

        let payload_to_update : Partial<PeriodsConfig> = {}

        if(period.start_time){
          payload_to_update.start_time = period.start_time
          payload_to_update.end_time = period.end_time
        }

        if(period.subjects_division_masters_id) payload_to_update.subjects_division_masters_id = period.subjects_division_masters_id
        if(period.staff_enrollment_id) payload_to_update.staff_enrollment_id = period.staff_enrollment_id
        if(period.lab_id) payload_to_update.lab_id = period.lab_id
        if(period.is_pt !== undefined) payload_to_update.is_pt = period.is_pt
        if(period.is_free_period !== undefined) payload_to_update.is_free_period = period.is_free_period
        if(period.is_break !== undefined) {
          payload_to_update.is_break = period.is_break
          payload_to_update.subjects_division_masters_id = null
          payload_to_update.staff_enrollment_id = null
          payload_to_update.lab_id = null
          payload_to_update.is_pt = false
          payload_to_update.is_free_period = false
        }

        check_period_config.merge(payload_to_update);
        await check_period_config.save()
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

  /**
   * Auto-generate a weekly timetable for a class/division.
   * Returns periods config for each day, according to all configs and constraints.
   * Input: ctx, class_id, division_id, academic_session_id
   */
  async generateWeeklyTimeTableForClass(ctx: HttpContext) {
    // let class_id = ctx.params.class_id;
    let division_id = ctx.params.division_id;
    let academic_session_id = ctx.request.input('academic_session');
    // 1. Validate session, class, division, user
    const academic_session = await AcademicSession.query()
      .where('id', academic_session_id)
      .andWhere('school_id', ctx.auth.user!.school_id)
      .first();
    if (!academic_session) {
      return ctx.response.badRequest({ message: 'Academic session not found' });
    }
    if (!academic_session.is_active) {
      return ctx.response.badRequest({ message: 'Academic session is not active' });
    }
    const division = await Divisions.query().where('id', division_id).first();
    if (!division) {
      return ctx.response.badRequest({ message: 'Division not found' });
    }
    let clas = await Classes.query()
      .where('id', division.class_id)
      .andWhere('school_id', ctx.auth.user!.school_id)
      .first();

    if (!clas) {
      return ctx.response.badRequest({ message: 'Class not found for provided Division' });
    }

    if (division.class_id !== clas?.id) {
      return ctx.response.badRequest({ message: 'Division does not belong to class' });
    }
    // 2. Fetch configs
    const school_timetable_config = await SchoolTimeTableConfig.query()
      .preload('lab_config')
      .preload('class_day_config', (query) => {
        query.where('class_id', clas.id);
      })
      .where('academic_session_id', academic_session_id)
      .first();
    if (!school_timetable_config) {
      return ctx.response.badRequest({ message: 'School Time Table Config not found' });
    }
    const class_day_configs = school_timetable_config.class_day_config;
    const lab_configs = school_timetable_config.lab_config;
    // 2.1. Fetch subject-division mappings and staff assignments
    const subjectDivisionMasters = await SubjectDivisionMaster.query()
      .preload('subject_staff_divisioin_master')
      .preload('subject')
      .where('division_id', division_id)
      .andWhere('academic_session_id', academic_session_id)
      .andWhere('status', 'Active');

    // Build a map: subjectDivisionId -> { subject, teachers: [staffEnrollmentId, ...] }
    const subjectTeacherMap: Record<number, { subject: any, teachers: number[] }> = {};
    for (const sdm of subjectDivisionMasters) {
      subjectTeacherMap[sdm.id] = {
        subject: sdm.subject,
        teachers: sdm.subject_staff_divisioin_master
          .filter((ssm) => ssm.status === 'Active')
          .map((ssm) => ssm.staff_enrollment_id),
      };
    }
    // Now subjectTeacherMap can be used for random assignment in the timetable loop.
    // TODO: Fetch subject mappings, teacher assignments, etc.
    // 3. For each day, generate periods
    let week_timetable: Array<{ class_day_config_id: number, periods: TypeForPeriodsConfig[] }> = [];
    let totalFreePeriods = 0;
    let labDays: number[] = []; // store class_day_config_id for lab days

    for (const dayConfig of class_day_configs) {
      let periods: TypeForPeriodsConfig[] = [];
      let allowedDurations = Array.isArray(dayConfig.allowed_durations)
        ? dayConfig.allowed_durations
        : JSON.parse(dayConfig.allowed_durations || '[]');
      let numPeriods = school_timetable_config.max_periods_per_day;
      let startTime = dayConfig.day_start_time || '08:00';
      let periodDuration = school_timetable_config.default_period_duration;
      let currentTime = startTime;
      let usedSubjects: Record<number, number> = {};
      let subjectDivisionIds = Object.keys(subjectTeacherMap).map(Number);

      // Decide if this day will have a lab block (2 consecutive periods)
      let assignLabToday = false;
      if (
        lab_configs.length > 0 &&
        labDays.length < 3 &&
        (labDays.length < 2 || Math.random() < 0.5) // ensure at least 2 days, max 3
      ) {
        assignLabToday = true;
        labDays.push(dayConfig.id);
      }

      let i = 0;
      while (i < numPeriods) {
        let assigned = false;
        let attempt = 0;

        // LAB BLOCK: assign 2 consecutive periods if needed
        if (assignLabToday && i <= numPeriods - 2) {
          // Pick a random lab and a random subject that requires lab
          let lab = lab_configs[Math.floor(Math.random() * lab_configs.length)];
          // You may want to filter subjectDivisionIds for lab subjects only
          let labSubjectDivisionIds = subjectDivisionIds; // TODO: filter for lab subjects if needed
          let randomSubjectDivisionId = labSubjectDivisionIds[Math.floor(Math.random() * labSubjectDivisionIds.length)];
          let subjectEntry = subjectTeacherMap[randomSubjectDivisionId];
          if (subjectEntry && subjectEntry.teachers.length > 0) {
            let randomTeacherId = subjectEntry.teachers[Math.floor(Math.random() * subjectEntry.teachers.length)];
            let periodStart = currentTime;
            let periodEndMinutes = this.timeToMinutes(periodStart) + periodDuration;
            let periodEnd = `${String(Math.floor(periodEndMinutes / 60)).padStart(2, '0')}:${String(periodEndMinutes % 60).padStart(2, '0')}`;
            let periodConfig: TypeForPeriodsConfig = {
              class_day_config_id: dayConfig.id,
              division_id: division_id,
              period_order: i + 1,
              start_time: periodStart,
              end_time: periodEnd,
              is_break: false,
              subjects_division_masters_id: randomSubjectDivisionId,
              staff_enrollment_id: randomTeacherId,
              lab_id: lab.id,
              is_pt: false,
              is_free_period: false,
            };
            let teacherAvailable = await this.checkTeacherAvailability(periodConfig, dayConfig, school_timetable_config);
            let labAvailable = await this.checklabAvailability(periodConfig, dayConfig, school_timetable_config);
            if (teacherAvailable.result && labAvailable.result) {
              // Assign two consecutive lab periods
              periods.push(periodConfig);
              // Second period
              let nextPeriodStart = periodEnd;
              let nextPeriodEndMinutes = this.timeToMinutes(nextPeriodStart) + periodDuration;
              let nextPeriodEnd = `${String(Math.floor(nextPeriodEndMinutes / 60)).padStart(2, '0')}:${String(nextPeriodEndMinutes % 60).padStart(2, '0')}`;
              let periodConfig2: TypeForPeriodsConfig = {
                ...periodConfig,
                period_order: i + 2,
                start_time: nextPeriodStart,
                end_time: nextPeriodEnd,
              };
              periods.push(periodConfig2);
              currentTime = nextPeriodEnd;
              usedSubjects[randomSubjectDivisionId] = (usedSubjects[randomSubjectDivisionId] || 0) + 2;
              i += 2;
              continue;
            }
          }
          // If lab assignment fails, fallback to normal assignment below
        }

        // NORMAL PERIOD ASSIGNMENT
        while (!assigned && attempt < 3) {
          let randomSubjectDivisionId = subjectDivisionIds[Math.floor(Math.random() * subjectDivisionIds.length)];
          let subjectEntry = subjectTeacherMap[randomSubjectDivisionId];
          if (!subjectEntry || subjectEntry.teachers.length === 0) {
            attempt++;
            continue;
          }
          // Max 3 same subject per day
          if ((usedSubjects[randomSubjectDivisionId] || 0) >= 3) {
            attempt++;
            continue;
          }
          // No more than 2 consecutive same subject
          if (
            periods.length >= 2 &&
            periods[periods.length - 1].subjects_division_masters_id === randomSubjectDivisionId &&
            periods[periods.length - 2].subjects_division_masters_id === randomSubjectDivisionId
          ) {
            attempt++;
            continue;
          }
          let randomTeacherId = subjectEntry.teachers[Math.floor(Math.random() * subjectEntry.teachers.length)];
          let periodStart = currentTime;
          let periodEndMinutes = this.timeToMinutes(periodStart) + periodDuration;
          let periodEnd = `${String(Math.floor(periodEndMinutes / 60)).padStart(2, '0')}:${String(periodEndMinutes % 60).padStart(2, '0')}`;
          let periodConfig: TypeForPeriodsConfig = {
            class_day_config_id: dayConfig.id,
            division_id: division_id,
            period_order: i + 1,
            start_time: periodStart,
            end_time: periodEnd,
            is_break: false,
            subjects_division_masters_id: randomSubjectDivisionId,
            staff_enrollment_id: randomTeacherId,
            lab_id: null,
            is_pt: false,
            is_free_period: false,
          };
          let teacherAvailable = await this.checkTeacherAvailability(periodConfig, dayConfig, school_timetable_config);
          if (teacherAvailable.result) {
            assigned = true;
            periods.push(periodConfig);
            currentTime = periodEnd;
            usedSubjects[randomSubjectDivisionId] = (usedSubjects[randomSubjectDivisionId] || 0) + 1;
          } else {
            attempt++;
          }
        }
        if (!assigned) {
          // Only 1 or 2 free periods allowed for the week
          if (totalFreePeriods < 2) {
            let periodStart = currentTime;
            let periodEndMinutes = this.timeToMinutes(periodStart) + periodDuration;
            let periodEnd = `${String(Math.floor(periodEndMinutes / 60)).padStart(2, '0')}:${String(periodEndMinutes % 60).padStart(2, '0')}`;
            periods.push({
              class_day_config_id: dayConfig.id,
              division_id: division_id,
              period_order: i + 1,
              start_time: periodStart,
              end_time: periodEnd,
              is_break: false,
              subjects_division_masters_id: null,
              staff_enrollment_id: null,
              lab_id: null,
              is_pt: false,
              is_free_period: true,
            });
            currentTime = periodEnd;
            totalFreePeriods++;
          } else {
            // If free period limit reached, assign a random valid subject/teacher ignoring constraints
            let randomSubjectDivisionId = subjectDivisionIds[Math.floor(Math.random() * subjectDivisionIds.length)];
            let subjectEntry = subjectTeacherMap[randomSubjectDivisionId];
            let randomTeacherId = subjectEntry.teachers[Math.floor(Math.random() * subjectEntry.teachers.length)];
            let periodStart = currentTime;
            let periodEndMinutes = this.timeToMinutes(periodStart) + periodDuration;
            let periodEnd = `${String(Math.floor(periodEndMinutes / 60)).padStart(2, '0')}:${String(periodEndMinutes % 60).padStart(2, '0')}`;
            periods.push({
              class_day_config_id: dayConfig.id,
              division_id: division_id,
              period_order: i + 1,
              start_time: periodStart,
              end_time: periodEnd,
              is_break: false,
              subjects_division_masters_id: randomSubjectDivisionId,
              staff_enrollment_id: randomTeacherId,
              lab_id: null,
              is_pt: false,
              is_free_period: false,
            });
            currentTime = periodEnd;
          }
        }
        i++;
      }
      week_timetable.push({ class_day_config_id: dayConfig.id, periods });
    }
    return ctx.response.status(200).json({
      message: 'Weekly timetable generated successfully',
      timetable: week_timetable
    })
  }


}





















// async generateWeeklyTimeTableForClass(ctx: HttpContext) {
//     // let class_id = ctx.params.class_id;
//     let division_id = ctx.params.division_id;
//     let academic_session_id = ctx.request.input('academic_session');
//     // 1. Validate session, class, division, user
//     const academic_session = await AcademicSession.query()
//       .where('id', academic_session_id)
//       .andWhere('school_id', ctx.auth.user!.school_id)
//       .first();
//     if (!academic_session) {
//       return ctx.response.badRequest({ message: 'Academic session not found' });
//     }
//     if (!academic_session.is_active) {
//       return ctx.response.badRequest({ message: 'Academic session is not active' });
//     }
//     const division = await Divisions.query().where('id', division_id).first();
//     if (!division) {
//       return ctx.response.badRequest({ message: 'Division not found' });
//     }
//     let clas = await Classes.query()
//       .where('id', division.class_id)
//       .andWhere('school_id', ctx.auth.user!.school_id)
//       .first();

//     if (!clas) {
//       return ctx.response.badRequest({ message: 'Class not found for provided Division' });
//     }

//     if (division.class_id !== clas?.id) {
//       return ctx.response.badRequest({ message: 'Division does not belong to class' });
//     }
//     // 2. Fetch configs
//     const school_timetable_config = await SchoolTimeTableConfig.query()
//       .preload('lab_config')
//       .preload('class_day_config', (query) => {
//         query.where('class_id', clas.id);
//       })
//       .where('academic_session_id', academic_session_id)
//       .first();
//     if (!school_timetable_config) {
//       return ctx.response.badRequest({ message: 'School Time Table Config not found' });
//     }
//     const class_day_configs = school_timetable_config.class_day_config;
//     const lab_configs = school_timetable_config.lab_config;
//     // 2.1. Fetch subject-division mappings and staff assignments
//     const subjectDivisionMasters = await SubjectDivisionMaster.query()
//       .preload('subject_staff_divisioin_master')
//       .preload('subject')
//       .where('division_id', division_id)
//       .andWhere('academic_session_id', academic_session_id)
//       .andWhere('status', 'Active');

//     // Build a map: subjectDivisionId -> { subject, teachers: [staffEnrollmentId, ...] }
//     const subjectTeacherMap: Record<number, { subject: any, teachers: number[] }> = {};
//     for (const sdm of subjectDivisionMasters) {
//       subjectTeacherMap[sdm.id] = {
//         subject: sdm.subject,
//         teachers: sdm.subject_staff_divisioin_master
//           .filter((ssm) => ssm.status === 'Active')
//           .map((ssm) => ssm.staff_enrollment_id),
//       };
//     }
//     // Now subjectTeacherMap can be used for random assignment in the timetable loop.
//     // TODO: Fetch subject mappings, teacher assignments, etc.
//     // 3. For each day, generate periods
//     let week_timetable: Array<{ class_day_config_id: number, periods: TypeForPeriodsConfig[] }> = [];
//     for (const dayConfig of class_day_configs) {
//       let periods: TypeForPeriodsConfig[] = [];
//       let allowedDurations = Array.isArray(dayConfig.allowed_durations)
//         ? dayConfig.allowed_durations
//         : JSON.parse(dayConfig.allowed_durations || '[]');
//       let numPeriods = school_timetable_config.max_periods_per_day;
//       let startTime = dayConfig.day_start_time || '08:00';
//       let periodDuration = school_timetable_config.default_period_duration;
//       let currentTime = startTime;
//       let usedSubjects: Record<number, number> = {};
//       let subjectDivisionIds = Object.keys(subjectTeacherMap).map(Number);
//       for (let i = 0; i < numPeriods; i++) {
//         let assigned = false;
//         let attempt = 0;
//         while (!assigned && attempt < 3) {
//           let randomSubjectDivisionId = subjectDivisionIds[Math.floor(Math.random() * subjectDivisionIds.length)];
//           let subjectEntry = subjectTeacherMap[randomSubjectDivisionId];
//           if (!subjectEntry || subjectEntry.teachers.length === 0) {
//             attempt++;
//             continue;
//           }
//           let randomTeacherId = subjectEntry.teachers[Math.floor(Math.random() * subjectEntry.teachers.length)];
//           let periodStart = currentTime;
//           let periodEndMinutes = this.timeToMinutes(periodStart) + periodDuration;
//           let periodEnd = `${String(Math.floor(periodEndMinutes / 60)).padStart(2, '0')}:${String(periodEndMinutes % 60).padStart(2, '0')}`;
//           let periodConfig: TypeForPeriodsConfig = {
//             class_day_config_id: dayConfig.id,
//             division_id: division_id,
//             period_order: i + 1,
//             start_time: periodStart,
//             end_time: periodEnd,
//             is_break: false,
//             subjects_division_masters_id: randomSubjectDivisionId,
//             staff_enrollment_id: randomTeacherId,
//             lab_id: null,
//             is_pt: false,
//             is_free_period: false,
//           };
//           let teacherAvailable = await this.checkTeacherAvailability(periodConfig, dayConfig, school_timetable_config);
//           if (teacherAvailable.result) {
//             assigned = true;
//             periods.push(periodConfig);
//             currentTime = periodEnd;
//             usedSubjects[randomSubjectDivisionId] = (usedSubjects[randomSubjectDivisionId] || 0) + 1;
//           } else {
//             attempt++;
//           }
//         }
//         if (!assigned) {
//           let periodStart = currentTime;
//           let periodEndMinutes = this.timeToMinutes(periodStart) + periodDuration;
//           let periodEnd = `${String(Math.floor(periodEndMinutes / 60)).padStart(2, '0')}:${String(periodEndMinutes % 60).padStart(2, '0')}`;
//           periods.push({
//             class_day_config_id: dayConfig.id,
//             division_id: division_id,
//             period_order: i + 1,
//             start_time: periodStart,
//             end_time: periodEnd,
//             is_break: false,
//             subjects_division_masters_id: null,
//             staff_enrollment_id: null,
//             lab_id: null,
//             is_pt: false,
//             is_free_period: true,
//           });
//           currentTime = periodEnd;
//         }
//       }
//       week_timetable.push({ class_day_config_id: dayConfig.id, periods });
//     }
//     return ctx.response.status(200).json({
//       message: 'Weekly timetable generated successfully',
//       timetable: week_timetable
//     })
//   }
