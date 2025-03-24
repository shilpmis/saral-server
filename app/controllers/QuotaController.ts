import type { HttpContext } from '@adonisjs/core/http'
import Quota from "#models/Quota";

export default class QuotasController {
  public async createQuotaForSeats(ctx: HttpContext) {
    const data = ctx.request.only(['name', 'description', 'eligibility_criteria']);
    const quota = await Quota.create(data);
    return ctx.response.created(quota);
  }

  public async listAllQuotas(ctx : HttpContext) {
    return await Quota.query().where('school_id', ctx.auth.user!.school_id);
  }

  public async delete({ params, response }: HttpContext) {
    const quota = await Quota.findOrFail(params.id);
    await quota.delete();
    return response.noContent();
  }

  public async updateQuota({ params, request }: HttpContext) {
    const quota = await Quota.findOrFail(params.id);
    quota.merge(request.only(['name', 'description', 'eligibility_criteria']));
    await quota.save();
    return quota;
  }
}
