import type { HttpContext } from '@adonisjs/core/http'
import Staff from '#models/Staff'
import { CreateValidatorForStaff, UpdateValidatorForStaff } from '#validators/Staff'
import StaffMaster from '#models/StaffMaster';


export default class StaffController {

  async index(ctx: HttpContext) {
    const staff = await Staff.query().paginate(ctx.request.input('page', 1), 10);
    return ctx.response.json(staff.serialize());
  }


  async createStaff(ctx: HttpContext) {

    // Check whether this role is associalted with this school
    const payload = await CreateValidatorForStaff.validate(ctx.request.body());

    const role = await StaffMaster.findBy('id', payload.staff_role_id);
    
    if(!role){
      return ctx.response.status(404).json({
        message : "This role is not available for your school ! Please add valid role ."
      })
    }
    
    if(role.school_id !=  ctx.auth.user?.school_id){
      return ctx.response.status(401).json({
        message : "You are not authorized to perform this action !"
      })
    }

    let staff = await Staff.create(payload);
    return ctx.response.json(staff.serialize());

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



