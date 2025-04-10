import Classes from '#models/Classes'
import type { HttpContext } from '@adonisjs/core/http'
import {
  CreateValidatorForMultipleStundets,
  CreateValidatorForUpload,
  CreateValidatorStundet,
  UpdateValidatorForStundets,
} from '#validators/Stundets'
import Students from '#models/Students'
import StudentMeta from '#models/StudentMeta'
import db from '@adonisjs/lucid/services/db'
import { parseAndReturnJSON } from '../../utility/parseCsv.js'
import path from 'path'
import app from '@adonisjs/core/services/app'
import ExcelJS from 'exceljs'
import StudentEnrollments from '#models/StudentEnrollments'
import AcademicSession from '#models/AcademicSession'
import Schools from '#models/Schools'
import Divisions from '#models/Divisions'

// Helper function to generate unique enrollment codes
interface GenerateUniqueEnrollmentCodeParams {
  prefix: string;
  trx: any; // Replace `any` with the specific type for the transaction object if available
}

async function generateUniqueEnrollmentCode({ prefix, trx }: GenerateUniqueEnrollmentCodeParams): Promise<string> {
  const maxAttempts = 10;
  let attempts = 0;

  while (attempts < maxAttempts) {
    // Generate a random code
    const randomPart = Math.floor(1000 + Math.random() * 9000);
    const enrollmentCode = `${prefix}${randomPart}`;

    // Check if this code already exists in the database
    const existingStudent = await Students.query({ client: trx })
      .where('enrollment_code', enrollmentCode)
      .first();

    // If no student has this code, return it
    if (!existingStudent) {
      return enrollmentCode;
    }

    attempts++;
  }

  // If we've tried multiple times and still have collisions,
  // use timestamp + random to ensure uniqueness
  const timestamp = Date.now().toString().slice(-5);
  const randomPart = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}${timestamp}${randomPart}`;
}

export default class StundetsController {
  async indexClassStudents(ctx: HttpContext) {
    const division_id = ctx.params.class_id
    const academic_session_id = ctx.params.academic_session_id
    const page = ctx.request.input('page', 1)
    const is_meta_req = ctx.request.input('student_meta', false) === 'true'

    const division = await Divisions.query().where('id', division_id).first()

    if (!division) {
      return ctx.response
        .status(404)
        .json({ message: 'No class has been found! Please provide a valid class.' })
    }

    let check_class = await Classes.query()
      .where('id', division?.class_id)
      .andWhere('school_id', ctx.auth.user!.school_id)
      .first()

    if (!check_class) {
      return ctx.response
        .status(401)
        .json({ message: 'You are not authorized to perform this action!' })
    }

    try {
      let studentsQuery = await StudentEnrollments.query()
        .where('division_id', division_id)
        .andWhere('academic_session_id', academic_session_id)
        .preload('student', (studentQuery) => {
          if (is_meta_req) {
            studentQuery.preload('student_meta')
          }
        })
        .paginate(page, 10)

      const students = studentsQuery.all()
      const pageMeta = studentsQuery.getMeta()

      let res = {
        data: students.map((student) => {
          return {
            ...student.student.serialize(),
            class_id: student.id,
          }
        }),
        meta: pageMeta,
      }

      return ctx.response.status(200).json(res)
    } catch (error) {
      return ctx.response
        .status(500)
        .json({ message: 'Error fetching students', error: error.message })
    }
  }

  async fetchStudent(ctx: HttpContext) {
    const student_id = ctx.params.student_id
    const school_id = ctx.auth.user!.school_id
    const is_meta_req = ctx.request.input('student_meta', false) === 'true'

    if (school_id !== ctx.auth.user?.school_id) {
      return ctx.response
        .status(401)
        .json({ message: 'You are  not authorized to perform this action!' })
    }

    let active_session = await AcademicSession.query()
      .where('is_active', true)
      .andWhere('school_id', school_id)
      .first()

    if (!active_session) {
      return ctx.response.status(404).json({ message: 'No active academic session found!' })
    }

    try {
      // Fetch the student enrollment record
      const studentEnrollment = await StudentEnrollments.query()
        .where('student_id', student_id)
        .andWhere('academic_session_id', active_session.id)
        .first()

      if (!studentEnrollment) {
        return ctx.response.status(404).json({ message: 'No Student Enrollment Available!' })
      }

      let student: Students | null = null

      if (is_meta_req) {
        student = await Students.query().where('id', student_id).preload('student_meta').first()
      } else {
        student = await Students.query().where('id', student_id).first()
      }
      return ctx.response
        .status(200)
        .json({ ...student?.serialize(), class_id: studentEnrollment.division_id })
    } catch (error) {
      return ctx.response
        .status(500)
        .json({ message: 'Error fetching student', error: error.message })
    }
  }

  async fetchStudentInDetail(ctx: HttpContext) {
    let student_id = ctx.params.student_id
    let academic_session_id = ctx.request.qs().academic_session

    if (!student_id) {
      return ctx.response.status(400).json({ message: 'Student ID is required' })
    }

    if (!academic_session_id) {
      return ctx.response.status(400).json({ message: 'Academic session is required' })
    }

    let academic_session = await AcademicSession.query()
      .where('id', academic_session_id)
      .andWhere('school_id', ctx.auth.user!.school_id)
      .first()

    if (!academic_session) {
      return ctx.response.status(404).json({ message: 'Academic session not found' })
    }

    let detailed_student_data = await StudentEnrollments.query()
      .preload('student', (studentQuery) => {
        studentQuery.preload('student_meta')
      })
      .preload('division', (divisionQuery) => {
        divisionQuery.preload('class')
        // divisionQuery.where('academic_session_id', academic_session_id)
      })
      .preload('fees_status', (feesStatusQuery) => {
        feesStatusQuery.preload('paid_fees')
        feesStatusQuery.where('academic_session_id', academic_session_id)
      })
      .preload('provided_concession', (query) => {
        query.preload('fees_plan', (query) => {
          query.where('academic_session_id', academic_session_id)
        })
        query.where('academic_session_id', academic_session_id)
      })
      //. where('academic_session_id', academic_session_id)
      .where('student_id', student_id)
      .andWhere('academic_session_id', academic_session_id)
      .first()

    if (!detailed_student_data) {
      return ctx.response.status(404).json({ message: 'Student not found' })
    }
    return ctx.response.status(200).json(detailed_student_data)
  }

  async createSingleStudent(ctx: HttpContext) {
    const academic_session_id = ctx.request.qs().academic_session
    const trx = await db.transaction()
    try {
      const academicSession = await AcademicSession.query()
        .where('id', academic_session_id)
        .andWhere('school_id', ctx.auth.user!.school_id)
        .first()

      if (!academicSession) {
        return ctx.response.status(404).json({ message: 'Academic Session not found' })
      }

      let school_id = ctx.auth.user!.school_id

      let payload = await CreateValidatorStundet.validate(ctx.request.body())

      let std = await Classes.query()
        .where('id', payload.students_data.class_id)
        .andWhere('school_id', ctx.auth.user!.school_id)
        .first()

      if (!std) {
        return ctx.response.status(404).json({ message: 'Class not found.' })
      }

      if (ctx.auth.user?.role_id != 1) {
        return ctx.response
          .status(401)
          .json({ message: 'You are not authorized to perform this action!' })
      }

      // Remove class_id from payload.students_data
      const { class_id, remarks, ...studentDataWithoutClassId } = payload.students_data

      // Create student within the transaction with unique enrollment code
      let student_data = await Students.create(
        {
          ...studentDataWithoutClassId,
          school_id: school_id,
          enrollment_code: await generateUniqueEnrollmentCode({ prefix: 'ENR', trx }),
        },
        { client: trx }
      )

      // Create student meta data within the transaction
      let student_meta_data_payload = await StudentMeta.create(
        { ...payload.student_meta_data, student_id: student_data.id },
        { client: trx }
      )

      // Add a row in the student_enrollments table within the transaction
      await StudentEnrollments.create(
        {
          student_id: student_data.id,
          division_id: class_id,
          academic_session_id: academicSession.id,
          is_new_admission: true,
          status: 'pursuing',
          remarks: remarks || '',
        },
        { client: trx }
      )

      // Commit the transaction
      await trx.commit()

      return ctx.response
        .status(201)
        .json({ student_data: student_data, student_meta: student_meta_data_payload })
    } catch (error) {
      // Rollback the transaction in case of error
      console.log('Error while create single student', error)
      await trx.rollback()
      return ctx.response
        .status(500)
        .json({ message: 'Error creating student', error: error.message })
    }
  }

  /**
   * TODO : Need to update as per academic session
   */
  async createMultipleStudents(ctx: HttpContext) {
    let school_id = ctx.auth.user!.school_id
    let class_id = ctx.params.class_id

    if (!class_id) {
      return ctx.response.badRequest({ message: 'Class is required' })
    }

    let std = await Classes.findOrFail(class_id)

    if (std.school_id !== school_id || ctx.auth.user?.role_id !== 1) {
      return ctx.response
        .status(401)
        .json({ message: 'You are not authorized to perform this action!' })
    }

    let payload = await CreateValidatorForMultipleStundets.validate(ctx.request.body())

    let res_array: any = []
    // Start a transaction
    const trx = await db.transaction()

    try {
      for (var i = 0; i < payload.length; i++) {
        let student_data = await Students.create(
          { 
            ...payload[i].students_data, 
            school_id: school_id,
            enrollment_code: await generateUniqueEnrollmentCode({ prefix: 'ENR', trx })
          },
          { client: trx }
        )

        let student_meta_data_payload = await StudentMeta.create(
          {
            ...payload[i].student_meta_data,
            student_id: student_data.id,
          },
          { client: trx }
        )

        res_array.push({ student_data: student_data, student_meta: student_meta_data_payload })
      }

      //  Commit the transaction if both inserts succeed
      await trx.commit()

      return ctx.response.status(201).json(res_array)
    } catch (error) {
      //  Rollback if any step fails
      await trx.rollback()
      return ctx.response
        .status(500)
        .json({ message: 'Something went wrong!', error: error.message })
    }
  }

  async updateStudents(ctx: HttpContext) {
    let student_id = ctx.params.student_id

    let StudentEnrollment = await StudentEnrollments.query()
      .where('student_id', student_id)
      .preload('student', (studentQuery) => {
        studentQuery.preload('student_meta')
      })
      .first()

    if (!StudentEnrollment) {
      return ctx.response.status(404).json({ message: 'Student Enrollment not found.' })
    }

    let enroll_student = StudentEnrollment.serialize()

    if (enroll_student.student.school_id !== ctx.auth.user?.school_id) {
      return ctx.response
        .status(401)
        .json({ message: 'You are not authorized to perform this action!' })
    }

    // let student = await Students.findOrFail(student_id);
    // let student_meta = await StudentMeta.findByOrFail('student_id', student_id);

    let student = StudentEnrollment.student
    let student_meta = StudentEnrollment.student.student_meta

    let payload = await UpdateValidatorForStundets.validate(ctx.request.body())
    const trx = await db.transaction()

    try {
      if (payload.students_data && Object.keys(payload.students_data).length > 0) {
        student = (await student.merge(payload.students_data).save()).useTransaction(trx)
      }

      if (payload.student_meta_data && Object.keys(payload.student_meta_data).length > 0) {
        if (student_meta) {
          student_meta = (
            await student_meta.merge(payload.student_meta_data).save()
          ).useTransaction(trx)
        }
      }

      await trx.commit()

      return ctx.response.status(200).json({
        students_data: student,
        student_meta_data: student_meta,
      })
    } catch (error) {
      console.log('Erro while Update Student', error)
      await trx.rollback()
      return ctx.response
        .status(500)
        .json({ message: 'Something went wrong!', error: error.message })
    }
  }

  public async bulkUploadStudents(ctx: HttpContext) {
    const school_id = ctx.auth.user!.school_id
    const division_id = ctx.params.division_id
    const academic_session_id = ctx.params.academic_session_id
    const role_id = ctx.auth.user!.role_id

    if (role_id !== 1) {
      return ctx.response
        .status(403)
        .json({ message: 'You are not authorized to perform this action.' })
    }

    if (!division_id) {
      return ctx.response.status(400).json({ message: 'Class ID is required.' })
    }

    let check_ActiveSession = await AcademicSession.query()
      .where('id', academic_session_id)
      .andWhere('school_id', school_id)
      .andWhere('is_active', true)
      .first()

    if (!check_ActiveSession) {
      return ctx.response.status(400).json({ message: 'Academic session not found.' })
    }

    let school = await Schools.find(school_id)

    if (!school) {
      return ctx.response.status(400).json({ message: 'School not found.' })
    }

    const classRecord = await Divisions.query().preload('class').where('id', division_id).first()

    if (!classRecord || classRecord.class.school_id !== school_id) {
      return ctx.response.status(400).json({ message: 'Class not found for your school.' })
    }

    const file = ctx.request.file('file', {
      extnames: ['csv', 'xlsx', 'xls'],
      size: '20mb',
    })

    if (!file) {
      return ctx.response.status(400).json({ message: 'No file uploaded.' })
    }

    const uploadDir = path.join(app.tmpPath(), 'uploads')
    await file.move(uploadDir)

    if (!file.isValid) {
      return ctx.response.badRequest({ message: file.errors })
    }

    const filePath = path.join(uploadDir, file.clientName)
    const jsonData = await parseAndReturnJSON(filePath)

    if (!jsonData.length) {
      return ctx.response.badRequest({ message: 'CSV file is empty or improperly formatted.' })
    }

    let validatedData = []
    let errors = []

    for (const [index, data] of jsonData.entries()) {
      let transformedData = {
        students_data: {
          first_name: data['First Name'],
          middle_name: data['Middle Name'] || null,
          last_name: data['Last Name'],
          gender: data['Gender'],
          gr_no: data['GR No'],
          primary_mobile: data['Mobile No'] || 8980995343,
          school_id: school_id,
          is_active: true,
          first_name_in_guj: data['First Name Gujarati'] || null,
          middle_name_in_guj: data['Middle Name Gujarati'] || null,
          last_name_in_guj: data['Last Name Gujarati'] || null,
          birth_date: data['Date of Birth'] || null,
          roll_number: data['Roll Number'] || null,
          father_name: data['Father Name'] || null,
          father_name_in_guj: data['Father Name in Gujarati'] || null,
          mother_name: data['Mother Name'] || null,
          mother_name_in_guj: data['Mother Name in Gujarati'] || null,
          aadhar_no: data['Aadhar No'] || null,
        },
        student_meta_data: {
          aadhar_dise_no: data['DISE Number'] || null,
          birth_place: data['Birth Place'] || null,
          birth_place_in_guj: data['Birth Place In Gujarati'] || null,
          religion: data['Religion'] || null,
          religion_in_guj: data['Religion In Gujarati'] || null,
          caste: data['Caste'] || null,
          caste_in_guj: data['Caste In Gujarati'] || null,
          category: data['Category'] || null,
          admission_date: data['Admission Date'] || null,
          admission_class_id: null,
          secondary_mobile: data['Other Mobile No'] || null,
          privious_school: data['Previous School'] || null,
          privious_school_in_guj: data['Previous School In Gujarati'] || null,
          address: data['Address'] || null,
          district: data['District'] || null,
          city: data['City'] || null,
          state: data['State'] || null,
          postal_code: data['Postal Code'] || null,
          bank_name: data['Bank Name'] || null,
          account_no: data['Account Number'] || null,
          IFSC_code: data['IFSC Code'] || null,
        },
      }
      try {
        const paylaod = await CreateValidatorForUpload.validate(transformedData)
        console.log('paylaod', paylaod.students_data.first_name)
        validatedData.push(transformedData)
      } catch (validationError) {
        errors.push({
          row: index + 1,
          message: validationError.message || 'Validation failed',
          errors: validationError.messages || [],
        })
      }
    }
    if (errors.length) {
      return ctx.response.status(400).json({ errors })
    }
    // Start transaction after validation
    const trx = await db.transaction()
    try {
      for (const validated_student of validatedData) {
        console.log(
          'validatedData',
          validated_student.student_meta_data?.aadhar_dise_no,
          validated_student.students_data.first_name
        )
        const student_data = await Students.create(
          {
            ...validated_student.students_data,
            enrollment_code: await generateUniqueEnrollmentCode({ prefix: school.branch_code, trx }),
          },
          { client: trx }
        )

        await StudentMeta.create(
          {
            ...validated_student.student_meta_data,
            student_id: student_data.id,
          },
          { client: trx }
        )

        await StudentEnrollments.create(
          {
            student_id: student_data.id,
            division_id: division_id,
            academic_session_id: academic_session_id,
            status: 'pursuing',
            is_new_admission: false,
          },
          { client: trx }
        )
      }

      await trx.commit()
      return ctx.response.status(201).json({
        message: 'Bulk upload successful.',
        totalInserted: validatedData.length,
      })
    } catch (error) {
      await trx.rollback()
      return ctx.response
        .status(500)
        .json({ message: 'Internal server error', error: error.message })
    }
  }

  public async exportToExcel(ctx: HttpContext) {
    const { fields } = ctx.request.only(['class_id', 'fields'])

    const division_id = ctx.params.class_id
    const academic_session_id = ctx.params.academic_session_id

    if (!division_id || !fields) {
      return ctx.response.badRequest({ error: 'Class ID and fields are required' })
    }

    let academic_session = await AcademicSession.query()
      .where('id', academic_session_id)
      .andWhere('school_id', ctx.auth.user!.school_id)
      .first()

    if (!academic_session) {
      return ctx.response.badRequest({ error: 'Academic session not found' })
    }

    let division = await Divisions.query()
      .preload('class', (query) => {
        query
          .select('id', 'class')
          .where('school_id', ctx.auth.user!.school_id)
          .andWhereNotNull('class') // Ensure the class value is not null
      })
      .where('id', division_id)
      // .andWhere('school_id', ctx.auth.user!.school_id)
      .andWhereHas('class', (query) => {
        query.whereNotNull('class') // Ensure the class value exists
      })
      .first()

    if (!division) {
      return ctx.response.badRequest({ error: 'Class not found' })
    }

    let class_students = await StudentEnrollments.query()
      .where('division_id', division_id)
      .andWhere('academic_session_id', academic_session_id)
      .preload('student', (studentQuery) => {
        studentQuery.preload('student_meta')
      })
    // Fetch student data
    // const students: Students[] = await Students.query().where('class_id', class_id);

    if (class_students.length === 0) {
      return ctx.response.badRequest({ error: 'No students found' })
    }

    // Merge `students` and `student_meta` data by `student_id`
    const mergedData = class_students.map((student: StudentEnrollments) => {
      const studentMeta = student.student.student_meta
      return { ...student.student.serialize(), ...studentMeta.serialize() }
    })

    // Create Excel Workbook
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet('Class Data')

    // Prepare Headers
    const headers = ['class', 'division', ...fields.students, ...fields.student_meta]
    worksheet.addRow(headers)

    // Add Data
    mergedData.forEach((data: any) => {
      const rowValues = headers.map((header: string) => {
        if (header === 'class') return division.class.class
        if (header === 'division') return division.division
        return (data as Record<string, any>)[header] || ''
      })
      worksheet.addRow(rowValues)
    })

    // Generate File Buffer
    const buffer = await workbook.xlsx.writeBuffer()

    // Generate unique value for the file name
    const uniqueValue = new Date().getTime()

    // Send Excel File as Response
    ctx.response.header(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    )
    ctx.response.header(
      'Content-Disposition',
      `attachment; filename="class_${division.class.class}-${division.division}_data_${uniqueValue}.xlsx"`
    )

    return ctx.response.send(buffer)
  }
}