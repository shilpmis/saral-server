import type { HttpContext } from '@adonisjs/core/http'
import Inquiries from '#models/Inquiries'
import { CreateValidatorForInquiries, UpdateValidatorForInquiries } from '#validators/Inquiries'


export default class InquiriesController {

  async indexInquiries(ctx: HttpContext) {

    let school_id = ctx.auth.user!.school_id;
    let page = ctx.request.input('page', 1);
    let inquiries = await Inquiries.query().where('school_id', school_id).orderBy('created_at', 'desc').paginate(page, 6);
    return ctx.response.status(200).json(inquiries);
  }

  async addInquiry(ctx: HttpContext) {

    let payload = await CreateValidatorForInquiries.validate(ctx.request.body());
    let inquiry = await Inquiries.create({...payload , created_by : ctx.auth.user!.id , school_id : ctx.auth.user!.school_id});
    return ctx.response.status(201).json(inquiry);

  }

  async updateInquiry(ctx: HttpContext) {
    let payload = await UpdateValidatorForInquiries.validate(ctx.request.body());

    let inquiry = await Inquiries.findOrFail(ctx.params.id);
    await inquiry.merge(payload).save();

    return ctx.response.status(200).json(inquiry);
  }

}



