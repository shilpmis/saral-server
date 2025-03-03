import OtherStaff from '#models/OtherStaff';
import StaffMaster from '#models/StaffMaster';
import { CreateValidatorForOtherStaff, UpdateValidatorForOtherStaff } from '#validators/OtherStaff';
import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db';

export default class OtherStaffsController {

    async indexOtherStaffForSchool(ctx: HttpContext) {


        let school_id = ctx.params.school_id;
        let page = ctx.request.input('page', 1);

        const other_staff = await OtherStaff.query()
            .preload('role_type')
            .where('school_id', school_id)
            .paginate(page, 6);
        return ctx.response.status(200).json(other_staff);

    }

    async createOtherStaff(ctx: HttpContext) {

        let school_id = ctx.params.school_id;
        let role_id = ctx.auth.user!.role_id

        let res_array: any = []
        const trx = await db.transaction();

        if (ctx.auth.user!.school_id == school_id && (role_id !== 3 && role_id !== 5)) {
            let payload = await CreateValidatorForOtherStaff.validate(ctx.request.body());

            for (let i = 0; i < payload.length; i++) {


                let role = await StaffMaster.query({ client: trx })
                    .where('school_id', school_id)
                    .andWhere('id', payload[i].staff_role_id)
                    .andWhere('is_teaching_role', false)

                if (role) {
                    let other_staff = await OtherStaff.create({ ...payload[i], school_id: school_id }, { client: trx });
                    res_array.push(other_staff);
                } else {
                    return ctx.response.status(404).
                        json({ message: "This role is not available for your school !" });
                }

            }

            //  Commit the transaction if both inserts succeed
            await trx.commit();

            return ctx.response.status(201).json(res_array);

        } else {
            return ctx.response.status(403).json({ message: "You are not authorized to create a staff" });
        }
    }

    async updateOtherStaff(ctx: HttpContext) {

        let role_id = ctx.auth.user!.role_id;
        let school_id = ctx.params.school_id;
        let other_staff_id = ctx.params.other_staff_id;

        const trx = await db.transaction();

        if (school_id !== ctx.auth.user!.school_id && (role_id !== 3 && role_id !== 5)) {
            let payload = await UpdateValidatorForOtherStaff.validate(ctx.request.body());
            let other_staff = (await OtherStaff.findOrFail(other_staff_id)).useTransaction(trx);
            if (other_staff) {
                if (payload.staff_role_id && payload.staff_role_id !== other_staff.staff_role_id) {
                    let role = await StaffMaster.query({ client: trx })
                        .where('school_id', school_id)
                        .andWhere('id', payload.staff_role_id)
                        .andWhere('is_teaching_role', true)

                    if (!role) {
                        return ctx.response.status(404).
                            json({ message: "This role is not available for your school !" });
                    }
                }
                (await other_staff.merge(payload).save()).useTransaction(trx);

                await trx.commit()
                return ctx.response.status(200).json(other_staff);
            } else {
                await trx.rollback()
                return ctx.response.status(404).json({ message: "Teacher not found" });
            }
        } else {
            await trx.rollback()
            return ctx.response.status(403).json({ message: "You are not authorized to create a Staff" });
        }
    }
}