import AcademicSession from '#models/AcademicSession';
import OtherStaffMaster from '#models/OtherStaff';
import StaffMaster from '#models/StaffMaster';
import Teacher from '#models/Teacher';
import { CreateValidatorForStaffRole, UpdateValidatorForStaffRole } from '#validators/StaffMaster';
import type { HttpContext } from '@adonisjs/core/http'
// import db from '@adonisjs/lucid/services/db';

export default class StaffMasterController {

    async indexStaffMasterForSchool(ctx: HttpContext) {
        // let school_id = ctx.auth.user?.school_id;

        let role = ctx.request.input('role', 'all');
        let staffs: StaffMaster[] = []
        if (ctx.params.school_id == ctx.auth.user?.school_id) {
            if (role == 'teacher') {
                staffs = await StaffMaster
                    .query()
                    .where('school_id', ctx.params.school_id)
                    .andWhere('is_teaching_role', true);
            } else if (role == 'other') {
                staffs = await StaffMaster
                    .query()
                    .where('school_id', ctx.params.school_id)
                    .andWhere('is_teaching_role', false);
            } else {
                staffs = await StaffMaster
                    .query()
                    .where('school_id', ctx.params.school_id)
            }
            return ctx.response.json(staffs);
        } else {
            return ctx.response.status(404).json({ message: 'Please provide valid School ID.' });
        }
    }

    async createStaffRole(ctx: HttpContext) {

        let school_id = ctx.auth.user!.school_id;
        const academic_session_id = ctx.request.input('academic_session');

        if (!academic_session_id) {
            return ctx.response.status(400).json({ message: 'Please provide academic session id.' });
        }

        let academic_session = await AcademicSession.query().where('id', academic_session_id).andWhere('school_id', school_id).first();

        if (!academic_session) {
            return ctx.response.status(404).json({ message: 'Academic session not found.' });
        }

        if (ctx.auth.user?.role_id !== 1) {
            return ctx.response.status(403).json({ message: 'You are not allocated to manage this functions.' });
        }
        const payload = await CreateValidatorForStaffRole.validate(ctx.request.body());
        const created_class = await StaffMaster.create({ 
            ...payload, 
            school_id: school_id,
            permissions: {},
            academic_session_id: academic_session_id
         });
        return ctx.response.json(created_class.serialize());
    }

    async updateStaffRole(ctx: HttpContext) {
        // let school_id = ctx.auth.user?.school_id
        if (ctx.auth.user?.role_id !== 1) {
            return ctx.response.status(403).json({ message: 'You are not allocated to manage this functions.' });
        }
        const payload = await UpdateValidatorForStaffRole.validate(ctx.request.body());
        const updated_class = await StaffMaster.findOrFail(ctx.params.id);
        updated_class.merge(payload);
        await updated_class.save();
        return ctx.response.json(updated_class.serialize());
    }

    async deleteStaffRole(ctx: HttpContext) {

        const school_id = ctx.auth.user?.school_id
        if (ctx.auth.user?.role_id !== 1) {
            return ctx.response.status(403).json({ message: 'You are not allocated to manage this functions.' });
        }
        const staff_to_delete = await StaffMaster.findOrFail(ctx.params.id);
        if (staff_to_delete && school_id) {

            /**
             *  check if does any staff is been allocated with this role , if yes then don't delete it.
            */
            let total_associated_teacher = 0;
            if (staff_to_delete.is_teaching_role) {
                total_associated_teacher = await Teacher
                    .query()
                    .where('school_id', school_id)
                    .andWhere('staff_role_id', staff_to_delete.id).first() ? 1 : 0;
            } else {
                total_associated_teacher = await OtherStaffMaster
                    .query()
                    .where('school_id', school_id)
                    .andWhere('staff_role_id', staff_to_delete.id).first() ? 1 : 0;
            }

            if (total_associated_teacher > 0) {
                return ctx.response.status(403).json({ message: 'This role is associated with some staff members ! You can not delete this role.' });
            }
            await staff_to_delete.delete();
            return ctx.response.status(201).json({ message: 'Role has been succesfully deleted.' });
        } else {
            return ctx.response.status(404).json({ message: 'Role not found.' });
        }
    }
}