/// app/controllers/AttendanceController.ts
import { HttpContext } from '@adonisjs/core/http'
import AttendanceMaster from '#models/AttendanceMasters'
import AttendanceDetail from '#models/AattendanceDetail'
import { DateTime } from 'luxon'
import db from '@adonisjs/lucid/services/db'
import { ValidatorForMarkAttendance } from '#validators/attendance'

export default class AttendanceController {
  /**
   * For Teachers: Mark attendance for a class
   *
   */
  async markAttendance(ctx: HttpContext) {
    const payload = await ValidatorForMarkAttendance.validate(ctx.request.body())
    const { class_id, date } = payload
    const teacher_id = ctx.auth.user!.staff_id

    const attendance_date = DateTime.fromJSDate(new Date(date))
    const today = DateTime.now().startOf('day')

    if (attendance_date > today) {
      return ctx.response.status(400).json({
        message: "You can't mark the attendance for future dates !",
      })
    }

    try {
      // Check if attendance already exists for this date and class
      const existingAttendance = await AttendanceMaster.query()
        .where('class_id', class_id)
        .where('attendance_date', date)
        .first()

      if (existingAttendance) {
        return ctx.response.status(400).json({
          message: 'Attendance already marked for this date',
        })
      }

      // Start transaction
      const trx = await db.transaction()

      if (!teacher_id) {
        return ctx.response.status(401).json({
          message: 'You are not authorized peron to mark the attendance of this class !',
        })
      }
      try {
        // Create attendance master entry
        const attendanceMaster = await AttendanceMaster.create(
          {
            school_id: ctx.auth.user?.school_id,
            class_id: payload.class_id,
            teacher_id: payload.marked_by,
            attendance_date: payload.date,
          },
          { client: trx }
        )

        // Create attendance details for each student
        const attendanceDetails = payload.attendance_data.map((data) => ({
          attendance_master_id: attendanceMaster.id,
          student_id: data.student_id,
          attendance_status: data.status,
          remarks: data.remarks || null,
        }))

        await AttendanceDetail.createMany([...attendanceDetails], { client: trx })

        await trx.commit()

        return ctx.response.status(201).json({
          message: 'Attendance marked successfully',
          data: attendanceMaster,
        })
      } catch (error) {
        await trx.rollback()
        throw error
      }
    } catch (error) {
      return ctx.response.status(500).json({
        message: 'Error marking attendance',
        error: error.message,
      })
    }
  }

  /**
   * For Admin: Fetch attendance details by class and date
   */
  async getAttendanceDetails(ctx: HttpContext) {
    const { class_id, unix_date } = ctx.params
    const school_id = ctx.auth.user!.school_id

    let date = new Date(unix_date * 1000).toISOString().split('T')[0]

    // Validate date range
    const requestedDate = DateTime.fromISO(date)
    const today = DateTime.now().startOf('day')
    const twoMonthsAgo = today.minus({ months: 2 }).startOf('month')

    // Check if date is in future
    if (requestedDate > today) {
      return ctx.response.status(400).json({
        message: 'Cannot access attendance for future dates',
      })
    }

    // Check if date is too old (before previous month)
    if (requestedDate < twoMonthsAgo) {
      return ctx.response.status(400).json({
        message: 'Cannot access attendance older than 2 months',
      })
    }

    try {
      const attendance = await AttendanceMaster.query()
        .where('school_id', school_id)
        .where('class_id', class_id)
        .where('attendance_date', date)
        .preload('attendance_details', (query) => {
          query.preload('student', (studentQuery) => {
            studentQuery.select('id', 'first_name', 'middle_name', 'last_name', 'roll_number')
          })
        })
        .first()

      if (!attendance) {
        // Fetch students assigned to this class for new attendance marking
        const students = await db
          .query()
          .from('students')
          .where('class_id', class_id)
          .where('school_id', school_id)
          .where('is_active', true)
          .select('id', 'first_name', 'last_name', 'roll_number')
          .orderBy('roll_number', 'asc')

        return ctx.response.status(200).json({
          date,
          class_id,
          marked_by: null,
          attendance_data: students.map((student) => ({
            student_id: student.id,
            student_name: `${student.first_name} ${student.last_name}`,
            roll_number: student.roll_number,
            status: null,
            remarks: null,
          })),
          is_marked: false,
        })
      }

      // Format the response
      const formattedAttendance = {
        date: attendance.attendance_date,
        class_id: attendance.class_id,
        marked_by: attendance.teacher_id,
        attendance_data: attendance.attendance_details.map((detail) => ({
          student_id: detail.student_id,
          student_name: `${detail.student.first_name} ${detail.student.last_name}`,
          roll_number: detail.student.roll_number,
          status: detail.attendance_status,
          remarks: detail.remarks,
        })),
        is_marked: true,
      }

      return ctx.response.status(200).json(formattedAttendance)
    } catch (error) {
      return ctx.response.status(500).json({
        message: 'Error fetching attendance details',
        error: error.message,
      })
    }
  }

  /**
   * Get attendance statistics for admin dashboard
   */
  async getAttendanceStats(ctx: HttpContext) {
    const { class_id, section_id, from_date, to_date } = ctx.request.qs()
    const school_id = ctx.auth.user!.school_id

    try {
      const stats = await AttendanceMaster.query()
        .where('school_id', school_id)
        .where('class_id', class_id)
        .where('section_id', section_id)
        .whereBetween('attendance_date', [from_date, to_date])
        .preload('attendance_details', (query) => {
          query.select('attendance_status')
        })
        .orderBy('attendance_date', 'asc')

      // Calculate daily statistics
      const dailyStats = stats.map((day) => {
        const total = day.attendance_details.length
        const present = day.attendance_details.filter(
          (d) => d.attendance_status === 'present'
        ).length
        const absent = day.attendance_details.filter((d) => d.attendance_status === 'absent').length
        const late = day.attendance_details.filter((d) => d.attendance_status === 'late').length

        return {
          date: day.attendance_date,
          total_students: total,
          present,
          absent,
          late,
          attendance_percentage: ((present + late) / total) * 100,
        }
      })

      return ctx.response.status(200).json(dailyStats)
    } catch (error) {
      return ctx.response.status(500).json({
        message: 'Error fetching attendance statistics',
        error: error.message,
      })
    }
  }
}
