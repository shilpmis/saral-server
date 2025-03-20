import type { HttpContext } from '@adonisjs/core/http'
import Staff from '#models/Staff'
import { CreateValidatorForStaff, UpdateValidatorForStaff } from '#validators/Staff'
import StaffMaster from '#models/StaffMaster';
import db from '@adonisjs/lucid/services/db';
import StaffEnrollment from '#models/StaffEnrollment';
import AcademicSession from '#models/AcademicSession';
import path from 'node:path';
import app from '@adonisjs/core/services/app';
import { parseAndReturnJSON } from '../../utility/parseCsv.js';
import ExcelJS from 'exceljs'


export default class StaffController {

  async indexStaff(ctx: HttpContext) {

    let type = ctx.request.input('type', 'all');
    let academic_session_id = ctx.request.input('academic_sessions');
    let page = ctx.request.input('page', 1);
    let school_id = ctx.auth.user!.school_id;

    let staff: Staff[] = [];

    if (type === 'teaching') {
      if (academic_session_id === 0) {
        staff = await db.query()
          .from('staff as s')
          .join('staff_enrollments as se', 's.staff_id', 'se.staff_id')
          .join('staff_role_master as sm', 's.staff_role_id', 'sm.id')
          .where('s.school_id', school_id)
          .where('sm.is_teaching', 1)
          .select(['s.*', 'sm.role', 'sm.working_hours'])
          .paginate(page, 10);

      } else {
        staff = await db.query()
          .from('staff as s')
          .join('staff_enrollments as se', 's.id', 'se.staff_id')
          .join('staff_role_master as sm', 's.staff_role_id', 'sm.id')
          .where('s.school_id', school_id)
          .where('se.academic_session_id', academic_session_id)
          .where('sm.is_teaching_role', 1)
          .select(['s.*', 'sm.role', 'sm.working_hours'])
          .paginate(page, 10);
      }

      return ctx.response.status(200).json(staff);
    } else if (type === 'other') {
      if (academic_session_id === 0) {
        staff = await db.query()
          .from('staff as s')
          .join('staff_enrollments as se', 's.staff_id', 'se.staff_id')
          .join('staff_role_master as sm', 's.staff_role_id', 'sm.id')
          .where('s.school_id', school_id)
          .where('sm.is_teaching', 0)
          .select(['s.*', 'sm.role', 'sm.working_hours'])
          .paginate(page, 10);

      } else {
        staff = await db.query()
          .from('staff as s')
          .join('staff_enrollments as se', 's.id', 'se.staff_id')
          .join('staff_role_master as sm', 's.staff_role_id', 'sm.id')
          .where('s.school_id', school_id)
          .where('se.academic_session_id', academic_session_id)
          .where('sm.is_teaching_role', 0)
          .select(['s.*', 'sm.role as role', 'sm.working_hours as working_hours'])
          .paginate(page, 10);
      }

      return ctx.response.status(200).json(staff);
    } else {

    }

    return ctx.response.status(200).json([]);

  }

  async createStaff(ctx: HttpContext) {
    const trx = await db.transaction()

    let academic_session_id = ctx.request.input('academic_sessions', 0);
    let school_id = ctx.auth.user!.school_id;

    if (academic_session_id === 0) {
      return ctx.response.status(400).json({
        message: "Academic session is required!"
      })
    }

    let academic_session = await AcademicSession.query()
      .where('id', academic_session_id)
      .where('school_id', school_id)
      .first()

    if (!academic_session) {
      return ctx.response.status(404).json({
        message: "Academic session not found!"
      })
    }

    try {
      // Validate request data
      const payload = await CreateValidatorForStaff.validate(ctx.request.body())

      // Check whether this role is associated with this school
      const role = await StaffMaster.findBy('id', payload.staff_role_id)
      if (!role) {
        return ctx.response.status(404).json({
          message: "This role is not available for your school! Please add a valid role."
        })
      }

      if (role.school_id != ctx.auth.user?.school_id) {
        return ctx.response.status(401).json({
          message: "You are not authorized to perform this action!"
        })
      }

      const { remarks, ...staffPayload } = payload

      // Create staff within the transaction
      const staff = await Staff.create({
        ...staffPayload,
        school_id: school_id,
        is_teching_staff: role.is_teaching_role,
        is_active: staffPayload.employment_status === 'Resigned' ? false : true,
        employee_code: 'EMP' + Math.floor(1000 + Math.random() * 9000)
      }, { client: trx })

      // Insert data into the StaffEnrollment table within the transaction
      await StaffEnrollment.create({
        academic_session_id: academic_session_id,
        staff_id: staff.id,
        school_id: school_id,
        status: 'Retained',
        remarks: remarks || ''
      }, { client: trx })

      // Commit the transaction
      await trx.commit()

      return ctx.response.status(201).json(staff.serialize())
    } catch (error) {
      // Rollback the transaction in case of error
      console.log("error while creating staff", error)
      await trx.rollback()
      return ctx.response.status(500).json({ message: 'Error creating staff', error: error.message })
    }
  }

  async updateStaff(ctx: HttpContext) {

    let role_id = ctx.auth.user!.role_id;
    let school_id = ctx.auth.user!.school_id;
    let staff_id = ctx.params.staff_id;

    const trx = await db.transaction();

    if ((role_id == 1 || role_id == 2 || role_id == 4)) {
      let payload = await UpdateValidatorForStaff.validate(ctx.request.body());

      let staff = await Staff.query().where('id', staff_id).andWhere('school_id', school_id).first();

      if (staff) {
        // if (payload.staff_role_id && payload.staff_role_id !== staff.staff_role_id) {
        //   let role = await StaffMaster.query({ client: trx })
        //     .where('school_id', school_id)
        //     .andWhere('id', payload.staff_role_id)
        //     .andWhere('is_teaching_role', true)

        //   if (!role) {
        //     return ctx.response.status(404).
        //       json({ message: "This role is not available for your school !" });
        //   }
        // }
        (await staff.merge(payload).save()).useTransaction(trx);

        await trx.commit()
        return ctx.response.status(200).json(staff);
      } else {
        await trx.rollback()
        return ctx.response.status(404).json({ message: "Teacher not found" });
      }
    } else {
      await trx.rollback()
      return ctx.response.status(403).json({ message: "You are not authorized to create a teacher" });
    }
  }

  async bulkUploadStaff(ctx: HttpContext) {

    const school_id = ctx.auth.user!.school_id;
    const role_id = ctx.auth.user!.role_id;
    const academic_session_id = ctx.request.input('academic_sessions', 1);
    const staff_type = ctx.request.input('staff-type', 1);

    console.log("staff_type", staff_type, academic_session_id)

    if (staff_type !== 'teaching' && staff_type !== 'non-teaching') {
      return ctx.response.status(400).json({ message: "Invalid staff type" });
    }

    if (school_id !== ctx.auth.user!.school_id && (role_id === 3 || role_id === 5)) {
      return ctx.response.status(403).json({ message: "You are not authorized to create teachers." });
    }

    try {
      // Ensure a file is uploaded
      const csvFile = ctx.request.file('file', {
        extnames: ['csv'],
        size: '2mb',
      });

      if (!csvFile) {
        return ctx.response.badRequest({ message: 'CSV file is required.' });
      }

      // Move file to temp storage
      const uploadDir = path.join(app.tmpPath(), 'uploads');
      await csvFile.move(uploadDir);

      if (!csvFile.isValid) {
        return ctx.response.badRequest({ message: csvFile.errors });
      }

      // Construct file path
      const filePath = path.join(uploadDir, csvFile.clientName);

      // Parse CSV file into JSON
      const jsonData = await parseAndReturnJSON(filePath);

      if (!jsonData.length) {
        return ctx.response.badRequest({ message: 'CSV file is empty or improperly formatted.' });
      }

      // Start a database transaction
      const trx = await db.transaction();
      let staff_aaray = []
      try {

        for (const data of jsonData) {
          // Validate each object separately

          // Check if the staff role exists in the school and is a teaching role
          const role = await StaffMaster.query({ client: trx })
            .where('school_id', school_id)
            .andWhere('role', data.role.trim())
            .andWhere('is_teaching_role', staff_type === 'teaching' ? true : false)
            .first();

          if (!role) {
            await trx.rollback();
            return ctx.response.status(404).json({
              message: `Role ${data.role} is not available for your school.`,
            });
          }

          const validatedStaff = await CreateValidatorForStaff.validate({
            ...data,
            middle_name: data.middle_name ? data.middle_name : null,
            staff_role_id: role.id,
            mobile_number: data.phone_number,
          });
          // validatedData.push({ ...validatedTeacher, staff_role_id: role.id });
          const staff = await Staff.create({
            ...validatedStaff,
            is_teching_staff: role.is_teaching_role,
            staff_role_id: role.id,
            school_id: school_id,
            employee_code: 'EMP' + Math.floor(1000 + Math.random() * 9000)
          }, { client: trx });

          await StaffEnrollment.create({
            academic_session_id: academic_session_id,
            staff_id: staff.id,
            school_id: school_id,
            status: 'Retained',
            remarks: ''
          }, { client: trx })

          staff_aaray.push(staff)

        }

        await trx.commit();

        return ctx.response.status(201).json({
          message: 'Bulk upload successful',
          totalInserted: staff_aaray.length,
          data: staff_aaray,
        });
      } catch (validationError) {
        console.log("validationError", validationError);
        await trx.rollback();
        return ctx.response.status(400).json({
          message: 'Validation failed',
          errors: validationError.messages,
        });
      }
    } catch (error) {
      return ctx.response.internalServerError({
        message: 'An error occurred while processing the bulk upload.',
        error: error.message,
      });
    }
  }

  public async exportToExcel(ctx: HttpContext) {

    const { fields } = ctx.request.only(['fields']);

    const school_id = ctx.params.school_id;
    const academic_session_id = ctx.params.academic_session_id;
    const staff_type = ctx.request.input('staff-type');

    if (!school_id || !fields || !staff_type) {
      return ctx.response.badRequest({ error: 'School ID , Staff type and fields are required' })
    }

    if (staff_type !== 'teaching' && staff_type !== 'non-teaching') {
      return ctx.response.badRequest({ error: 'Invalid staff type' })
    }
    console.log(school_id, ctx.auth.user!.school_id)
    if (school_id != ctx.auth.user!.school_id) {
      return ctx.response.status(403).json({ message: "You are not authorized to perform this action" });
    }

    let academic_session = await AcademicSession.query().where('id', academic_session_id).andWhere('school_id', ctx.auth.user!.school_id).first();

    if (!academic_session) {
      return ctx.response.badRequest({ error: 'Academic session not found' })
    }

    let staff = await db.query()
      .from('staff as s')
      .join('staff_enrollments as se', 's.id', 'se.staff_id')
      .join('staff_role_master as sm', 's.staff_role_id', 'sm.id')
      .where('s.school_id', school_id)
      .where('sm.is_teaching_role', staff_type === 'teaching' ? 1 : 0)
      .select(['s.*', 'sm.role'])

    if (staff.length === 0) {
      return ctx.response.badRequest({ error: 'No Staff found !' })
    }

    const staffRoles = await StaffMaster.query()
      .where('school_id', school_id)
      .andWhere('is_teaching_role', staff_type === 'teaching' ? 1 : 0)
      // .andWhere('academic_session_id', academic_session_id);
    // Merge `students` and `student_meta` data by `student_id`

    if (staffRoles.length === 0) {
      return ctx.response.badRequest({ error: 'No Staff Role found !' })
    }

    const mergedData = staff;

    // Create Excel Workbook
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet('Class Data')

    // Prepare Headers
    const headers = [, ...fields]
    worksheet.addRow(headers)

    console.log("staffRoles" , staffRoles);
    // Add Data
    mergedData.forEach((data: any) => {
      const rowValues = headers.map((header: string) => {
        if (header === 'staff_role') {
          const role = staffRoles.find((role) => role.id === data.staff_role_id);
          console.log("data.staff_role_id " , data.staff_role_id)
          return role ? role.role : '';
        }
        return (data as Record<string, any>)[header] || ''
      })
      worksheet.addRow(rowValues)
    })

    // Generate File Buffer
    const buffer = await workbook.xlsx.writeBuffer()

    // Generate unique value for the file name
    const uniqueValue = new Date().getTime();

    // Send Excel File as Response
    ctx.response.header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    ctx.response.header('Content-Disposition', `attachment; filename="staff_${academic_session.session_name}_data_${uniqueValue}.xlsx"`)

    return ctx.response.send(buffer)
  }
}



