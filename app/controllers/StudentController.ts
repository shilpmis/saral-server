import Classes from '#models/Classes';
import type { HttpContext } from '@adonisjs/core/http'
import { CreateValidatorForMultipleStundets, CreateValidatorForUpload, CreateValidatorStundet, UpdateValidatorForStundets } from '#validators/Stundets';
import Students from '#models/Students';
import StudentMeta from '#models/StudentMeta';
import db from '@adonisjs/lucid/services/db';
import { parseAndReturnJSON } from '../../utility/parseCsv.js';
import path from 'path';
import app from '@adonisjs/core/services/app';
import ExcelJS from 'exceljs'
import StudentEnrollments from '#models/StudentEnrollments';
import AcademicSession from '#models/AcademicSession';
import Schools from '#models/Schools';

export default class StundetsController {

    async indexClassStudents(ctx: HttpContext) {

        const class_id = ctx.params.class_id;
        const academic_session_id = ctx.params.academic_session_id;
        const page = ctx.request.input('page', 1);
        const is_meta_req = ctx.request.input('student_meta', false) === "true";

        const std = await Classes.query()
            .where('id', class_id)
            .andWhere('school_id', ctx.auth.user!.school_id)
            .andWhere('school_id', ctx.auth.user!.school_id)
            .first();

        if (!std) {
            return ctx.response.status(404).json({ message: 'No class has been found! Please provide a valid class.' });
        }

        if (std.school_id !== ctx.auth.user?.school_id) {
            return ctx.response.status(401).json({ message: 'You are not authorized to perform this action!' });
        }

        try {
            let studentsQuery = await StudentEnrollments.query()
                .where('class_id', class_id)
                .andWhere('academic_session_id', academic_session_id)
                .preload('student', (studentQuery) => {
                    if (is_meta_req) {
                        studentQuery.preload('student_meta');
                    }
                }).paginate(page, 10);

            const students = studentsQuery.all();
            const pageMeta = studentsQuery.getMeta();

            let res = {
                data: students.map((student) => {
                    return {
                        ...student.student.serialize(),
                        class_id: student.class_id
                    }
                }),
                meta: pageMeta
            }

            return ctx.response.status(200).json(res);
        } catch (error) {
            return ctx.response.status(500).json({ message: 'Error fetching students', error: error.message });
        }
    }

    async fetchStudent(ctx: HttpContext) {
        const student_id = ctx.params.student_id;
        const school_id = ctx.auth.user!.school_id;
        const is_meta_req = ctx.request.input('student_meta', false) === "true";

        if (school_id !== ctx.auth.user?.school_id) {
            return ctx.response.status(401).json({ message: 'You are not authorized to perform this action!' });
        }

        try {
            // Fetch the student enrollment record
            const studentEnrollment = await StudentEnrollments.query()
                .where('student_id', student_id)
                .first();

            if (!studentEnrollment) {
                return ctx.response.status(404).json({ message: "No Student Enrollment Available!" });
            }

            let student: Students | null = null

            if (is_meta_req) {
                student = await Students
                    .query()
                    .where('id', student_id)
                    .preload('student_meta')
                    .first();
            } else {
                student = await Students
                    .query()
                    .where('id', student_id)
                    .first();
            }
            return ctx.response.status(200).json({ ...student?.serialize(), class_id: studentEnrollment.class_id });
        } catch (error) {
            return ctx.response.status(500).json({ message: 'Error fetching student', error: error.message });
        }
    }


    async createSingleStudent(ctx: HttpContext) {
        const academic_session_id = ctx.request.qs().academic_session;
        console.log(academic_session_id)
        const trx = await db.transaction()
        try {

            const academicSession = await AcademicSession
                .query()
                .where('id', academic_session_id)
                .andWhere('school_id', ctx.auth.user!.school_id).first()

            if (!academicSession) {
                return ctx.response.status(404).json({ message: 'Academic Session not found' })
            }

            let school_id = ctx.auth.user!.school_id;

            let payload = await CreateValidatorStundet.validate(ctx.request.body());

            console.log("payload", payload)

            let std = await Classes.query().where('id', payload.students_data.class_id).andWhere('school_id', ctx.auth.user!.school_id).first()

            if (!std) {
                return ctx.response.status(404).json({ message: "Class not found." })
            }

            if (ctx.auth.user?.role_id != 1) {
                return ctx.response.status(401).json({ message: 'You are not authorized to perform this action!' })
            }

            // Remove class_id from payload.students_data
            const { class_id, remarks, ...studentDataWithoutClassId } = payload.students_data


            // Create student within the transaction
            let student_data = await Students.create({
                ...studentDataWithoutClassId,
                school_id: school_id,
                enrollment_code: 'ENR' + Math.floor(1000 + Math.random() * 9000)
            }, { client: trx })

            // Create student meta data within the transaction
            let student_meta_data_payload = await StudentMeta.create({ ...payload.student_meta_data, student_id: student_data.id }, { client: trx })

            const isOldStudent = await StudentEnrollments.query().where('student_id', student_data.id).andWhere('status', '!=', 'Failed').first()

            // Add a row in the student_enrollments table within the transaction
            await StudentEnrollments.create({
                student_id: student_data.id,
                class_id: class_id,
                academic_session_id: academicSession.id,
                status: isOldStudent ? 'Permoted' : 'Pursuing',
                remarks: remarks || ''
            }, { client: trx })

            // Commit the transaction
            await trx.commit()

            return ctx.response.status(201).json({ student_data: student_data, student_meta: student_meta_data_payload })
        } catch (error) {
            // Rollback the transaction in case of error
            console.log(error)
            await trx.rollback()
            return ctx.response.status(500).json({ message: 'Error creating student', error: error.message })
        }
    }


    /**
     * TODO : Need to update as per academic session
     */
    async createMultipleStudents(ctx: HttpContext) {
        let school_id = ctx.auth.user!.school_id;
        let class_id = ctx.params.class_id;

        if (!class_id) {
            return ctx.response.badRequest({ message: "Class is required" });
        }

        let std = await Classes.findOrFail(class_id);

        if (std.school_id !== school_id || ctx.auth.user?.role_id !== 1) {
            return ctx.response
                .status(401)
                .json({ message: 'You are not authorized to perform this action!' });
        }

        let payload = await CreateValidatorForMultipleStundets.validate(ctx.request.body());

        let res_array: any = []
        // Start a transaction
        const trx = await db.transaction();

        try {

            for (var i = 0; i < payload.length; i++) {

                let student_data = await Students.create(
                    { ...payload[i].students_data, school_id: school_id }, { client: trx });

                let student_meta_data_payload = await StudentMeta.create({
                    ...payload[i].student_meta_data,
                    student_id: student_data.id
                }, { client: trx })

                res_array.push({ student_data: student_data, student_meta: student_meta_data_payload })

            }

            //  Commit the transaction if both inserts succeed
            await trx.commit();

            return ctx.response.status(201).json(res_array);
        } catch (error) {
            //  Rollback if any step fails
            await trx.rollback();
            return ctx.response.status(500).json({ message: "Something went wrong!", error: error.message });
        }
    }


    async updateStudents(ctx: HttpContext) {

        let student_id = ctx.params.student_id;

        let StudentEnrollment = await StudentEnrollments.query()
            .where('student_id', student_id)
            .preload('student', (studentQuery) => {
                studentQuery.preload('student_meta');
            })
            .first();

        if (!StudentEnrollment) {
            return ctx.response.status(404).json({ message: "Student Enrollment not found." });
        }

        let enroll_student = StudentEnrollment.serialize()

        if (enroll_student.student.school_id !== ctx.auth.user?.school_id) {
            return ctx.response.status(401).json({ message: 'You are not authorized to perform this action!' });
        }

        // let student = await Students.findOrFail(student_id);
        // let student_meta = await StudentMeta.findByOrFail('student_id', student_id);

        let student = StudentEnrollment.student;
        let student_meta = StudentEnrollment.student.student_meta;

        let payload = await UpdateValidatorForStundets.validate(ctx.request.body());
        console.log("payload", payload)
        const trx = await db.transaction();

        try {
            if (payload.students_data && Object.keys(payload.students_data).length > 0) {
                student = (await student.merge(payload.students_data).save()).useTransaction(trx);
            }

            if (payload.student_meta_data && Object.keys(payload.student_meta_data).length > 0) {
                if (student_meta) {
                    student_meta = (await student_meta.merge(payload.student_meta_data).save()).useTransaction(trx);
                }
            }

            await trx.commit();

            return ctx.response.status(200).json({
                students_data: student,
                student_meta_data: student_meta
            });

        } catch (error) {
            console.log(error)
            await trx.rollback()
            return ctx.response.status(500).json({ message: "Something went wrong!", error: error.message });
        }

    }

    public async bulkUploadStudents(ctx: HttpContext) {

        const school_id = ctx.params.school_id;
        const class_id = ctx.params.class_id;
        const academic_session_id = ctx.params.academic_session_id;
        const role_id = ctx.auth.user!.role_id;
        // Check if the user is authorized to perform this action


        if (school_id != ctx.auth.user?.school_id) {
            return ctx.response.status(403).json({ message: "You are not authorized to perform this action." });
        }

        if (role_id !== 1) {
            return ctx.response.status(403).json({ message: "You are not authorized to perform this action." });
        }

        if (!class_id) {
            return ctx.response.status(400).json({ message: "Class ID is required." });
        }

        let school = await Schools.findOrFail(school_id);

        const classRecord = await Classes.query()
            .where('id', class_id)
            .andWhere('school_id', school_id)
            .first();

        if (!classRecord) {
            return ctx.response.status(400).json({ message: "Class not found." });
        }

        try {
            // Ensure a file is uploaded
            const file = ctx.request.file('file', {
                extnames: ["csv",
                    "xlsx",
                    "xls",
                ],
                size: '20mb',

            });
            if (!file) {
                return ctx.response.status(400).json({ message: 'No file uploaded.' });
            }
            // Move file to temp storage
            const uploadDir = path.join(app.tmpPath(), 'uploads');
            await file.move(uploadDir);

            if (!file.isValid) {
                return ctx.response.badRequest({ message: file.errors });
            }

            // Construct file path
            const filePath = path.join(uploadDir, file.clientName);

            // Parse CSV file into JSON
            const jsonData = await parseAndReturnJSON(filePath);

            if (!jsonData.length) {
                return ctx.response.badRequest({ message: 'CSV file is empty or improperly formatted.' });
            }

            // Start a database transaction
            const trx = await db.transaction();

            try {
                let validatedData = [];
                let errors = [];
                for (const [index, data] of jsonData.entries()) {

                    // Transform the flat data into nested structure
                    let transformedData = {
                        students_data: {
                            first_name: data.first_name,
                            middle_name: data.middle_name,
                            last_name: data.last_name,
                            gender: data.gender,
                            gr_no: data.gr_no,
                            primary_mobile: data.phone_number,
                            school_id : school_id,
                            is_active: true,
                        },
                    };

                    try {
                        const validatedStudent = await CreateValidatorForUpload.validate(transformedData);
                        // Insert student data
                        const student_data = await Students.create({
                            ...validatedStudent.students_data,
                            enrollment_code: `${school.branch_code}` + Math.floor(1000 + Math.random() * 9000),
                        }, { client: trx });

                        // Insert student meta data
                        const student_meta_data_payload = await StudentMeta.create({
                            ...validatedStudent.student_meta_data,
                            student_id: student_data.id,
                        }, { client: trx });

                        const studentEnrollment = await StudentEnrollments.create({
                            student_id: student_data.id,
                            class_id: class_id,
                            academic_session_id: academic_session_id,
                            status: 'Pursuing',
                        }, { client: trx });

                        validatedData.push({ student_data, student_meta_data_payload, studentEnrollment });
                    } catch (validationError) {
                        console.log("validationError ", validationError)
                        errors.push({
                            row: index + 1,
                            message: 'Validation failed',
                            errors: validationError.messages,
                        });
                    }
                }

                // If there were errors, rollback transaction and return them
                if (errors.length) {
                    await trx.rollback();
                    return ctx.response.status(400).json({
                        message: 'Some records failed validation',
                        errors,
                    });
                }

                // Commit transaction if everything is fine
                await trx.commit();


                return ctx.response.status(201).json({
                    message: 'Bulk upload successful',
                    totalInserted: validatedData.length,
                    // data: validatedData,
                });
            } catch (validationError) {
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

        const { fields } = ctx.request.only(['class_id', 'fields'])

        const class_id = ctx.params.class_id;
        const academic_session_id = ctx.params.academic_session_id;

        if (!class_id || !fields) {
            return ctx.response.badRequest({ error: 'Class ID and fields are required' })
        }

        let academic_session = await AcademicSession.query().where('id', academic_session_id).andWhere('school_id', ctx.auth.user!.school_id).first();

        if (!academic_session) {
            return ctx.response.badRequest({ error: 'Academic session not found' })
        }

        let clas = await Classes.query().where('id', class_id).andWhere('school_id', ctx.auth.user!.school_id).first();

        if (!clas) {
            return ctx.response.badRequest({ error: 'Class not found' })
        }

        let class_students = await StudentEnrollments.query()
            .where('class_id', class_id)
            .andWhere('academic_session_id', academic_session_id)
            .preload('student', (studentQuery) => {
                studentQuery.preload('student_meta');
            });
        // Fetch student data
        // const students: Students[] = await Students.query().where('class_id', class_id);

        if (class_students.length === 0) {
            return ctx.response.badRequest({ error: 'No students found' })
        }

        // Merge `students` and `student_meta` data by `student_id`
        const mergedData = class_students.map((student: StudentEnrollments) => {
            const studentMeta = student.student.student_meta;
            return { ...student.student.serialize(), ...studentMeta.serialize() }
        })

        
        // Create Excel Workbook
        const workbook = new ExcelJS.Workbook()
        const worksheet = workbook.addWorksheet('Class Data')

        // Prepare Headers
        const headers = ['class', 'division', ...fields.students, ...fields.student_meta]
        worksheet.addRow(headers)
        
        // Add Data
        mergedData.forEach((data : any) => {
            const rowValues = headers.map((header: string) => {
                if (header === 'class') return clas.class
                if (header === 'division') return clas.division
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
        ctx.response.header('Content-Disposition', `attachment; filename="class_${class_id}_data_${uniqueValue}.xlsx"`)

        return ctx.response.send(buffer)
    }

}