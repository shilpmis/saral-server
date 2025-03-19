import QuotaAllocation from '#models/QuotaAllocation';
import type { HttpContext } from '@adonisjs/core/http'


export default class QuotaAllocationsController {
  public async allocateQuotaToClass({ request, response, params }: HttpContext) {
    const class_id = params.class_id;
    console.log("class_id", class_id);
    const data = request.only(['quota_id', 'total_seats']);
    
    const allocation = await QuotaAllocation.create({ ...data, class_id: Number(class_id), filled_seats: 0 });
    return response.created(allocation);
  }

  public async listAllQuotaAllocation() {
    return await QuotaAllocation.query().preload('quota').preload('class');
  }

  public async updateFilledSeats({ request, params }: HttpContext) {
    const allocation = await QuotaAllocation.findOrFail(params.id);
    allocation.filled_seats = request.input('filled_seats');
    await allocation.save();
    return allocation;
  }

  public async delete({ params, response }: HttpContext) {
    const allocation = await QuotaAllocation.findOrFail(params.id);
    await allocation.delete();
    return response.noContent();
  }
  
}
