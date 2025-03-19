import ClassSeatAvailability from '#models/ClassSeatAvailability';
import QuotaAllocation from '#models/QuotaAllocation';
import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db';


export default class QuotaAllocationsController {
  public async allocateQuotaToClass({ request, response }: HttpContext) {
    const data = request.only(['quota_id', 'total_seats', 'class_id'])

    // Start transaction
    const trx = await db.transaction()

    try {
      // Create the quota allocation
      const allocation = await QuotaAllocation.create(
        { ...data, filled_seats: 0 },
        { client: trx }
      )

      // Fetch the class seat availability
      const seatAvailability = await ClassSeatAvailability.query()
        .where('class_id', data.class_id)
        .firstOrFail()

      // Update the allocated seats in ClassSeatAvailability
      seatAvailability.useTransaction(trx)
      seatAvailability.quota_allocated_seats += data.total_seats
      seatAvailability.general_available_seats -= data.total_seats
      seatAvailability.remaining_seats -= data.total_seats

      await seatAvailability.save()

      // Commit transaction
      await trx.commit()

      return response.created({ message: 'Quota allocated successfully', allocation, seatAvailability })
    } catch (error) {
      // Rollback transaction on error
      await trx.rollback()
      return response.internalServerError({ error: 'Failed to allocate quota', details: error.message })
    }
  }

  public async listAllQuotaAllocation() {
    return await QuotaAllocation.query().preload('quota').preload('class');
  }

  public async updateFilledSeats({ request, params, response }: HttpContext) {
    const trx = await db.transaction()

    try {
      // Find the allocation entry
      const allocation = await QuotaAllocation.findOrFail(params.id)
      allocation.useTransaction(trx)

      const newFilledSeats = request.input('filled_seats')
      const seatDifference = newFilledSeats - allocation.filled_seats

      // Find the related class seat availability
      const seatAvailability = (await ClassSeatAvailability.query()
        .where('class_id', allocation.class_id)
        .firstOrFail())
        .useTransaction(trx)

      // Ensure we don't allow overfilling of seats
      if (seatAvailability.remaining_seats - seatDifference < 0) {
        await trx.rollback()
        return response.badRequest({ error: 'Not enough available seats' })
      }

      // Update the filled seats in QuotaAllocation
      allocation.filled_seats = newFilledSeats
      await allocation.save()

      // Update the remaining and filled seats in ClassSeatAvailability
      seatAvailability.filled_seats += seatDifference
      seatAvailability.remaining_seats -= seatDifference

      await seatAvailability.save()

      // Commit transaction
      await trx.commit()

      return response.ok({ message: 'Filled seats updated successfully', allocation, seatAvailability })
    } catch (error) {
      await trx.rollback()
      return response.internalServerError({ error: 'Failed to update filled seats', details: error.message })
    }
  }

  
  public async delete({ params, response }: HttpContext) {
    const trx = await db.transaction()

    try {
      const allocation = await QuotaAllocation.findOrFail(params.id)

      // Fetch the associated seat availability
      const seatAvailability = await ClassSeatAvailability.query()
        .where('class_id', allocation.class_id)
        .firstOrFail()

      // Adjust seat counts
      seatAvailability.useTransaction(trx)
      seatAvailability.quota_allocated_seats -= allocation.total_seats
      seatAvailability.general_available_seats += allocation.total_seats
      seatAvailability.remaining_seats += allocation.total_seats

      await seatAvailability.save()

      // Delete allocation
      await allocation.useTransaction(trx).delete()

      // Commit transaction
      await trx.commit()

      return response.noContent()
    } catch (error) {
      await trx.rollback()
      return response.internalServerError({ error: 'Failed to delete quota allocation', details: error.message })
    }
  }
  
}
