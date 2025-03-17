import QuotaAllocation from '#models/QuotaAllocation';
import type { HttpContext } from '@adonisjs/core/http'


export default class QuotaAllocationsController {
  public async allocate({ request, response }: HttpContext) {
    const data = request.only(['quota_id', 'class_id', 'total_seats']);
    const allocation = await QuotaAllocation.create({ ...data, filled_seats: 0 });
    return response.created(allocation);
  }

  public async list() {
    return await QuotaAllocation.query().preload('quota').preload('class');
  }

  public async updateFilledSeats({ request, params }: HttpContext) {
    const allocation = await QuotaAllocation.findOrFail(params.id);
    allocation.filled_seats = request.input('filled_seats');
    await allocation.save();
    return allocation;
  }
}
