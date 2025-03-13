import type { HttpContext } from '@adonisjs/core/http'
import Staff from '#models/Staff'
import { CreateValidatorForStaff, UpdateValidatorForStaff } from '#validators/Staff'
import StaffMaster from '#models/StaffMaster';
import db from '@adonisjs/lucid/services/db';
import StaffEnrollment from '#models/StaffEnrollment';


export default class StaffController {

  async index(ctx: HttpContext) {
    const page = ctx.request.input('page', 1)
    const staff = await StaffEnrollment.query().preload('staff').paginate(page, 10);
    return ctx.response.json(staff.serialize());
  }


  async createStaff(ctx: HttpContext) {
    const trx = await db.transaction()

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

      const {academic_id, remarks, ...staffPayload} = payload
      // Create staff within the transaction
      const staff = await Staff.create(staffPayload, { client: trx })

      // Insert data into the StaffEnrollment table within the transaction
      await StaffEnrollment.create({
        academicId: academic_id,
        staffId: staff.id,
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
    const payload = await UpdateValidatorForStaff.validate(ctx.request.body());
    const staff = await Staff.findOrFail(ctx.request.input('id'));
    await staff.merge(payload).save();
    return ctx.response.json(staff.serialize());
  }

  // async create(ctx: HttpContext) {
  //   const payload = await CreateValidatorForStaff.validate(ctx.request.all());
  //   const staff = await Staff.create(payload);
  //   return ctx.response.json(staff.serialize());
  // }

  // async store(ctx: HttpContext) { }

  // async show(ctx: HttpContext) {
  //   const staff = await Staff.findOrFail(ctx.request.input('id'));
  //   return ctx.response.json(staff.serialize());
  // }

  // async update(ctx: HttpContext) {
  //   const payload = await UpdateValidatorForStaff.validate(ctx.request.all());
  //   const staff = await Staff.findOrFail(ctx.request.input('id'));
  //   await staff.merge(payload).save();
  //   return ctx.response.json(staff.serialize());
  // }

  // async filterStaff(ctx: HttpContext) {
  //   const staff = await Staff.query().where('role', 'student').paginate(ctx.request.input('page', 1), 10);
  //   return ctx.response.json(staff.serialize());
  // }
}



