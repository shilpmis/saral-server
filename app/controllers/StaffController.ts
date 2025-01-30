import Staff from '#models/Staff';
import { CreateValidatorForStaff, UpdateValidatorForStaff } from '#validators/Staff';
import type { HttpContext } from '@adonisjs/core/http'

export default class StaffController {

    async indexStaffForSchool(ctx: HttpContext) {
        let school_id = ctx.auth.user?.school_id;
        if (school_id) {
            let staffs = await Staff.query().where('school_id', school_id);
            return ctx.response.json(staffs);
        } else {
            return ctx.response.status(404).json({ message: 'Please provide valid Class ID.' });
        }

    }

    async createStaffRole(ctx: HttpContext) {

        let school_id = ctx.auth.user?.school_id
        if (ctx.auth.user?.role_id !== 1) {
            return ctx.response.status(403).json({ message: 'You are not allocated to manage this functions.' });
        }
        const payload = await CreateValidatorForStaff.validate(ctx.request.body());
        const created_class = await Staff.create({ ...payload, school_id: school_id });
        return ctx.response.json(created_class.serialize());
    }

    async updateStaffRole(ctx: HttpContext) {
        // let school_id = ctx.auth.user?.school_id
        if (ctx.auth.user?.role_id !== 1) {
            return ctx.response.status(403).json({ message: 'You are not allocated to manage this functions.' });
        }
        const payload = await UpdateValidatorForStaff.validate(ctx.request.body());
        const updated_class = await Staff.findOrFail(ctx.params.id);
        updated_class.merge(payload);
        await updated_class.save();
        return ctx.response.json(updated_class.serialize());
    }

    async deleteStaffRole(ctx: HttpContext) {
        // let school_id = ctx.auth.user?.school_id
        if (ctx.auth.user?.role_id !== 1) {
            return ctx.response.status(403).json({ message: 'You are not allocated to manage this functions.' });
        }
        const class_to_delete = await Staff.findOrFail(ctx.params.id);

        // check whether this role are associated with any of the teacher or other staff , otherwise delete this .
    }
}