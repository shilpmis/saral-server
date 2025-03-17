import type { HttpContext } from '@adonisjs/core/http'
import Quota from "#models/Quota";

export default class QuotasController {
  public async create(ctx: HttpContext) {
    const data = ctx.request.only(['name', 'description', 'eligibility_criteria']);
    const quota = await Quota.create(data);
    return ctx.response.created(quota);
  }

  public async list() {
    return await Quota.all();
  }

  public async delete({ params, response }: HttpContext) {
    const quota = await Quota.findOrFail(params.id);
    await quota.delete();
    return response.noContent();
  }
}
