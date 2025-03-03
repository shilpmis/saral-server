import type { HttpContext } from '@adonisjs/core/http'
import Schools from '#models/Schools'
import { UpdateValidatorForSchools } from '#validators/Schools'
import { DateTime } from 'luxon'
import Students from '#models/Students'
import TeacherLeaveApplication from '#models/TeacherLeaveApplication'
import OtherStaffLeaveApplication from '#models/OtherStaffLeaveApplication'
import Inquiries from '#models/Inquiries'
import Teacher from '#models/Teacher'
import OtherStaff from '#models/OtherStaff'


export default class SchoolsController {


  async fetchSchoolDataForDashBoard(ctx: HttpContext) {
    try {
      const schoolId = ctx.auth.user!.school_id
      const today = DateTime.now().toFormat('yyyy-MM-dd')
      const currentYear = DateTime.now().year

      // Get total students
      const totalStudents = await Students.query()
        .where('school_id', schoolId)
        .count('* as total')

      // Get today's absent students
      // const attendance_master = await AttendanceMasters.query()
      //   .where('school_id', schoolId)
      //   .where('date', today)
      //   .where('status', 'absent')
      //   .count('* as total')

      // const absentStudents = await AattendanceDetail.query()
      //   .where('school_id', schoolId)
      //   .where('date', today)
      //   .where('status', 'absent')
      //   .count('* as total')

      // Get staff statistics
      const teachingstaffStatus = await Teacher.query()
        .where('school_id', schoolId)
        .select('staff_type')
        .count('* as total')
      // Get staff statistics

      const otherstaffStatus = await OtherStaff.query()
        .where('school_id', schoolId)
        .select('staff_type')
        .count('* as total')

      // Get absent teaching staff for today
      const absentTeachingStaff = await TeacherLeaveApplication.query()
        .where('school_id', schoolId)
        .where('leave_date', today)
        .count('* as total')

      // Get absent non-teaching staff for today
      const absentNonOtherStaff = await OtherStaffLeaveApplication.query()
        .where('school_id', schoolId)
        .where('leave_date', today)
        .count('* as total')

      // Get inquiries by class for current year
      const inquiries = await Inquiries.query()
        .where('school_id', schoolId)
        .whereRaw('YEAR(created_at) = ?', [currentYear])
        .select('class')
        .count('* as total')
        .groupBy('class')

      // Prepare staff data
      const staffData = {
        teaching: teachingstaffStatus || 0,
        nonTeaching: otherstaffStatus || 0,
        absentTeaching: absentTeachingStaff || 0,
        absentNonTeaching: absentNonOtherStaff || 0
      }

      return ctx.response.status(200).json({
        students: {
          total: totalStudents[0] || 0,
          absent: 0,
          // present: (totalStudents) - (absentStudents)
        },
        staff: staffData,
        inquiries: inquiries.reduce((acc : any, curr : any) => {
          acc[curr.grade_applying] = curr.total
          return acc
        }, {})
      })

    } catch (error) {
      return ctx.response.status(500).json({
        message: 'Error fetching dashboard data',
        error: error.message
      })
    }
  }

  async index(ctx: HttpContext) {

    let school_id = ctx.params.school_id;
    let school = await Schools.query().where('id', school_id).first();
    if (school) {
      return ctx.response.status(201).json(school);
    }
    return ctx.response.status(404).json({ message: 'School not found' });
  }

  async update(ctx: HttpContext) {

    let school_id = ctx.params.school_id;
    let school = await Schools.query().where('id', school_id).first();

    if (school) {
      if (ctx.auth.user?.role_id == 1 && school_id == ctx.auth.user.school_id) {
        const data = await UpdateValidatorForSchools.validate(ctx.request.body());
        school.merge(data);
        let updated_school = await school.save();
        return ctx.response.status(201).json(updated_school);
      } else {
        return ctx.response.status(401).json({ message: 'Unauthorized' });
      }
    }
    return ctx.response.status(404).json({ message: 'School not found' });
  }
}



