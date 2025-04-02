import type { HttpContext } from '@adonisjs/core/http'
import Quota from '#models/Quota'

export default class QuotasController {
  public async createQuotaForSeats(ctx: HttpContext) {
    try {
      const school_id = ctx.auth.user?.school_id
      const academic_session_id = ctx.request.qs().academic_session_id
      const data = ctx.request.only(['name', 'description', 'eligibility_criteria', 'is_active'])
      const quota = await Quota.create({ ...data, school_id, academic_session_id })
      return ctx.response.created(quota)
    } catch (error) {
      console.log('error while creating quota', error)
      return ctx.response.internalServerError({ message: 'Error creating quota', error })
    }
  }

  public async listAllQuotas(ctx: HttpContext) {
    return await Quota.query().where('school_id', ctx.auth.user!.school_id)
  }

  public async delete({ params, response }: HttpContext) {
    const quota = await Quota.findOrFail(params.id)
    await quota.delete()
    return response.noContent()
  }

  public async updateQuota({ params, request }: HttpContext) {
    const quota = await Quota.findOrFail(params.id)
    quota.merge(request.only(['name', 'description', 'eligibility_criteria', 'is_active']))
    await quota.save()
    return quota
  }
}
