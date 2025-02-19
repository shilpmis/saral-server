import Classes from '#models/Classes';
import type { HttpContext } from '@adonisjs/core/http'
import { CreateValidatorForStundets, UpdateValidatorForStundets } from '#validators/Stundets';
import Students from '#models/Students';
import StudentMeta from '#models/StudentMeta';
import db from '@adonisjs/lucid/services/db';

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

    async createStudents(ctx: HttpContext) {
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

        let payload = await CreateValidatorForStundets.validate(ctx.request.body());

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
}