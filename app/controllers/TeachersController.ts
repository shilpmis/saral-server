import StaffMaster from '#models/StaffMaster';
import Teacher from '#models/Teacher'
import { CreateTeacherValidator, CreateValidatorForTeachers, UpdateValidatorForTeachers } from '#validators/Teachers';
import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db';
import { parseAndReturnJSON } from '../../utility/parseCsv.js';
import app from '@adonisjs/core/services/app';
import path from 'node:path';
import User from '#models/User';
export default class TeachersController {

    async indexTeachersForSchool(ctx: HttpContext) {

        let school_id = ctx.params.school_id;
        let page = ctx.request.input('page', 1);

        const teachers = await Teacher.query()
            .preload('role_type')
            .where('school_id', school_id)
            .paginate(page, 6);
        return ctx.response.status(200).json(teachers);

    }

    async indexTeacherActiveAsUser(ctx: HttpContext) {
        let school_id = ctx.params.school_id;
        // let page = ctx.request.input('page', 1);

        // Fetch users with teacher_id
        const users = await User.query()
            .select(['saral_email', 'teacher_id'])
            .where('is_teacher', true)
            .andWhere('school_id', school_id);

        // Ensure teacherIds is a proper array of valid IDs
        const teacherIds = users
            .map((user) => user.teacher_id)  // Extract teacher_id values
            .filter((id) => id !== null && id !== undefined); // Remove null/undefined values

        if (teacherIds.length === 0) {
            return ctx.response.status(200).json([]); // Return empty array if no teachers found
        }

        // Fetch teachers using whereIn
        const teachers = await Teacher.query().whereIn('id', teacherIds);

        return ctx.response.status(200).json(teachers);
    }

    async indexTeacherNotActiveAsUser(ctx: HttpContext) {

        let school_id = ctx.auth.user!.school_id;
        // let page = ctx.request.input('page');

        const users = await User.query()
            .select(['saral_email', 'teacher_id'])
            .where('is_teacher', true)
            .andWhere('school_id', school_id);

        // Ensure teacherIds is a proper array of valid IDs
        const teacherIds = users
            .map((user) => user.teacher_id)  // Extract teacher_id values
            .filter((id) => id !== null && id !== undefined); // Remove null/undefined values



        if (teacherIds.length === 0) {
            return ctx.response.status(200).json([]); // Return empty array if no teachers found
        }


        let teachers = await Teacher.query().select(['id', 'first_name', 'last_name', 'staff_role_id'])
            .where('school_id', school_id)
            .whereNotIn('id', teacherIds);

        // if(page){
        //      teachers.paginate(ctx.request.input('page'), 6)
        // }
        // .paginate(page, 6);

        return ctx.response.status(200).json(teachers);

    }


    async createTeacher(ctx: HttpContext) {

        let school_id = ctx.params.school_id;
        let role_id = ctx.auth.user!.role_id

        let res_array: any = []
        const trx = await db.transaction();

        if (ctx.auth.user!.school_id == school_id && (role_id !== 3 && role_id !== 5)) {
            let payload = await CreateValidatorForTeachers.validate(ctx.request.body());

            for (let i = 0; i < payload.length; i++) {


                let role = await StaffMaster.query({ client: trx })
                    .where('school_id', school_id)
                    .andWhere('id', payload[i].staff_role_id)
                    .andWhere('is_teaching_role', true)

                if (role) {
                    let teacher = await Teacher.create({ ...payload[i], school_id: school_id }, { client: trx });
                    res_array.push(teacher);
                } else {
                    return ctx.response.status(404).
                        json({ message: "This role is not available for your school !" });
                }

            }

            //  Commit the transaction if both inserts succeed
            await trx.commit();

            return ctx.response.status(201).json(res_array);

        } else {
            return ctx.response.status(403).json({ message: "You are not authorized to create a teacher" });
        }
    }

    async updateTeacher(ctx: HttpContext) {

        let role_id = ctx.auth.user!.role_id;
        let school_id = ctx.params.school_id;
        let teacher_id = ctx.params.teacher_id;

        const trx = await db.transaction();

        if (school_id !== ctx.auth.user!.school_id && (role_id !== 3 && role_id !== 5)) {
            let payload = await UpdateValidatorForTeachers.validate(ctx.request.body());
            let teacher = (await Teacher.findOrFail(teacher_id)).useTransaction(trx);
            if (teacher) {
                if (payload.staff_role_id && payload.staff_role_id !== teacher.staff_role_id) {
                    let role = await StaffMaster.query({ client: trx })
                        .where('school_id', school_id)
                        .andWhere('id', payload.staff_role_id)
                        .andWhere('is_teaching_role', true)

                    if (!role) {
                        return ctx.response.status(404).
                            json({ message: "This role is not available for your school !" });
                    }
                }
                (await teacher.merge(payload).save()).useTransaction(trx);

                await trx.commit()
                return ctx.response.status(200).json(teacher);
            } else {
                await trx.rollback()
                return ctx.response.status(404).json({ message: "Teacher not found" });
            }
        } else {
            await trx.rollback()
            return ctx.response.status(403).json({ message: "You are not authorized to create a teacher" });
        }
    }

    async bulkUploadTeachers(ctx: HttpContext) {
        const school_id = ctx.params.school_id;
        const role_id = ctx.auth.user!.role_id;
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

            try {
                let validatedData = [];

                for (const data of jsonData) {
                    // Validate each object separately
                    const validatedTeacher = await CreateTeacherValidator.validate(data);

                    // Check if the staff role exists in the school and is a teaching role
                    const role = await StaffMaster.query({ client: trx })
                        .where('school_id', school_id)
                        .andWhere('id', validatedTeacher.staff_role_id)
                        .first();

                    if (!role) {
                        await trx.rollback();
                        return ctx.response.status(404).json({
                            message: `Role ID ${validatedTeacher.staff_role_id} is not available for your school.`,
                        });
                    }

                    validatedData.push({ ...validatedTeacher, school_id });
                }

                // Insert only if all records are valid
                const teachers = await Teacher.createMany(validatedData, { client: trx });

                // Commit the transaction
                await trx.commit();

                return ctx.response.status(201).json({
                    message: 'Bulk upload successful',
                    totalInserted: teachers.length,
                    data: teachers,
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