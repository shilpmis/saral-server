import Classes from '#models/Classes';
import type { HttpContext } from '@adonisjs/core/http'
import { CreateValidatorForMultipleStundets, CreateValidatorForUpload, CreateValidatorStundet, UpdateValidatorForStundets } from '#validators/Stundets';
import Students from '#models/Students';
import StudentMeta from '#models/StudentMeta';
import db from '@adonisjs/lucid/services/db';
import { parseAndReturnJSON } from '../../utility/parseCsv.js';
import path from 'path';
import app from '@adonisjs/core/services/app';

export default class StundetsController {

    async indexClassStudents(ctx: HttpContext) {

        // get ---> http://localhsot:3333/students/<class_id>?page=1&student_meta=false&asc=name

        let class_id = ctx.params.class_id;
        let page = ctx.request.input('page', 1);
        let is_meta_req = ctx.request.input('student_meta', false) === "true";

        let std = await Classes.findBy('id', class_id);

        if (std) {

            if (std.school_id != ctx.auth.user?.school_id) {
                return ctx.response
                    .status(401)
                    .json({ message: 'You are not authorized to perform this action!' });
            }

            let students = []

            if (is_meta_req) {
                students = await Students.query().where('class_id', class_id)
                    .preload('student_meta')
                    .orderBy('gr_no')
                    .paginate(page, 6);
            } else {
                students = await Students.query().where('class_id', class_id)
                    // .preload('student_meta')
                    .orderBy('gr_no')
                    .paginate(page, 6);
            }

            return ctx.response.status(200).json(students);

        } else {
            return ctx.response
                .status(404)
                .json({ message: 'No class has been found ! Please provide valid class' });
        }

    }

    async fetchStudent(ctx: HttpContext) {

        let student_id = ctx.params.student_id;
        let school_id = ctx.params.school_id;
        let is_meta_req = ctx.request.input('student_meta', false) === "true";

        if (school_id != ctx.auth.user?.school_id) {
            return ctx.response
                .status(401)
                .json({ message: 'You are not authorized to perform this action!' });
        }

        let student: any = {}

        if (is_meta_req) {
            student = await Students.query().where('id', student_id)
                .preload('student_meta').first();
        } else {
            student = await Students.query().where('id', student_id).first();
        }

        if (!student) return ctx.response.status(404).json({ message: "No Student Available !" });

        return ctx.response.status(200).json(student);

    }

    async createSingleStudent(ctx: HttpContext) {
        let school_id = ctx.auth.user!.school_id;
        // let class_id = ctx.params.class_id;

        let payload = await CreateValidatorStundet.validate(ctx.request.body());

        let std = await Classes.query().where('id', payload.students_data.class_id).andWhere('school_id', ctx.auth.user!.school_id).first();

        if (!std || ctx.auth.user?.role_id !== 1) {
            return ctx.response
                .status(401)
                .json({ message: 'You are not authorized to perform this action!' });
        }


        let student_data = await Students.create(
            { ...payload.students_data, school_id: school_id });

        let student_meta_data_payload = await StudentMeta.create({
            ...payload.student_meta_data,
            student_id: student_data.id
        })

        return ctx.response.status(201).json({ student_data: student_data, student_meta: student_meta_data_payload });

    }

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
                    { ...payload[i].students_data, class_id: class_id, school_id: school_id }, { client: trx });

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

        let student = await Students.findOrFail(student_id);
        let student_meta = await StudentMeta.findByOrFail('student_id', student_id);

        if (student.school_id != ctx.auth.user?.school_id) {
            return ctx.response
                .status(401)
                .json({ message: 'You are not authorized to perform this action!' });
        }
        let payload = await UpdateValidatorForStundets.validate(ctx.request.body());
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
            await trx.rollback()
            return ctx.response.status(500).json({ message: "Something went wrong!", error: error.message });
        }

    }

    public async bulkUploadStudents(ctx: HttpContext) {
        const school_id = ctx.auth.user!.school_id;
        const role_id = ctx.auth.user!.role_id;
        const class_id = ctx.request.input('class_id');
        console.log("class_id", class_id);
        // Check if the user is authorized to perform this action
        
        if(!class_id){
            return ctx.response.status(400).json({ message: "Class ID is required." });
        }

        if (role_id !== 1) {
            return ctx.response.status(403).json({ message: "You are not authorized to perform this action." });
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
    
            try {
                let validatedData = [];    
                let errors = [];

                for (const [index, data] of jsonData.entries()) {

                    // Transform the flat data into nested structure
                    const transformedData = {
                        students_data: {
                            gr_no: data.gr_no,
                            first_name: data.first_name,
                            middle_name: data.middle_name,
                            last_name: data.last_name,
                            first_name_in_guj: data.first_name_in_guj,
                            middle_name_in_guj: data.middle_name_in_guj,
                            last_name_in_guj: data.last_name_in_guj,
                            gender: data.gender,
                            birth_date: data.birth_date,
                            primary_mobile: data.primary_mobile,
                            father_name: data.father_name,
                            father_name_in_guj: data.father_name_in_guj,
                            mother_name: data.mother_name,
                            mother_name_in_guj: data.mother_name_in_guj,
                            roll_number: data.roll_number,
                            aadhar_no: data.aadhar_no,
                            is_active: data.is_active === 'TRUE', // Convert to boolean
                        },
                        student_meta_data: {
                            aadhar_dise_no: data.aadhar_dise_no,
                            birth_place: data.birth_place,
                            birth_place_in_guj: data.birth_place_in_guj,
                            religiion: data.religiion,
                            religiion_in_guj: data.religiion_in_guj,
                            caste: data.caste,
                            caste_in_guj: data.caste_in_guj,
                            category: data.category,
                            admission_date: data.admission_date,
                            secondary_mobile: data.secondary_mobile,
                            privious_school: data.privious_school,
                            privious_school_in_guj: data.privious_school_in_guj,
                            address: data.address,
                            district: data.district,
                            city: data.city,
                            state: data.state,
                            postal_code: data.postal_code,
                            bank_name: data.bank_name,
                            account_no: data.account_no,
                            IFSC_code: data.IFSC_code,
                        }
                    };
                
                    try {
                        // Remove class_id from validation and use class_name & division instead
                        const validatedStudent = await CreateValidatorForUpload.validate(transformedData);
                        // Find the class ID using school_id, class_name, and division
                        const classRecord = await Classes.query({ client: trx })
                            .where('school_id', school_id)
                            .andWhere('class', data.class)
                            .andWhere('division', data.division)
                            .first();


                        console.log("classRecord?.school_id !== school_id", classRecord?.school_id !== school_id)
                        console.log("classRecord?.id !== class_id", classRecord?.id !== class_id)

            
                        if((classRecord?.school_id != school_id ) && (classRecord?.id != class_id)){
                            errors.push({
                                row: index + 1,
                                message: `Class "${validatedStudent.students_data.class}" with division "${validatedStudent.students_data.division}" not found.`,
                            });
                            continue;
                        }
            
                        // Assign class ID dynamically
                        validatedStudent.students_data.class_id = classRecord?.id;
            
                        // Insert student data
                        const student_data = await Students.create({
                            ...validatedStudent.students_data,
                            school_id,
                        }, { client: trx });
                    //    console.log("student_data", student_data);
                        // Insert student meta data
                        const student_meta_data_payload = await StudentMeta.create({
                            ...validatedStudent.student_meta_data,
                            student_id: student_data.id,
                        }, { client: trx });
                        // console.log("student_meta_data_payload", student_meta_data_payload);
            
                        validatedData.push({ student_data, student_meta_data_payload });
                    } catch (validationError) {
                        console.log("validationError", validationError);
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
}