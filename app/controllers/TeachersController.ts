import StaffMaster from '#models/StaffMaster';
import Teacher from '#models/Teacher'
import { CreateValidatorForTeachers, UpdateValidatorForTeachers } from '#validators/Teachers';
import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db';

export default class TeachersController {

    async indexTeachersForSchool(ctx: HttpContext) {

        let school_id = ctx.params.school_id;
        let page = ctx.request.input('page', 1);

        const teachers = await Teacher.query()
            .where('school_id', school_id)
            .paginate(page, 6);
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
                    console.log("Check the payload====>" , {...payload[i] , school_id : ctx.auth.user!.school_id })
                    let teacher = await Teacher.create({...payload[i] , school_id : school_id}, { client: trx });
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

        console.log("teacher_id ====>" , teacher_id);

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
                
                return ctx.response.status(200).json(teacher);
            } else {
                return ctx.response.status(404).json({ message: "Teacher not found" });
            }
        } else {
            return ctx.response.status(403).json({ message: "You are not authorized to create a teacher" });
        }
    }
}