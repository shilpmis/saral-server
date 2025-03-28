import AcademicSession from '#models/AcademicSession';
import Classes from '#models/Classes';
import ClassSeatAvailability from '#models/ClassSeatAvailability';
import QuotaAllocation from '#models/QuotaAllocation';
import StudentEnrollments from '#models/StudentEnrollments';
import type { HttpContext } from '@adonisjs/core/http';

export default class ClassSeatAvailabilitiesController {
  
  /**
   * Add seat availability for a class
   */
  public async addSeatAvailability({ request, response }: HttpContext) {
    const { class_id, total_seats, academic_session_id } = request.only(['class_id', 'total_seats', 'academic_session_id']);

    // Check if the class exists
    const classData = await Classes.find(class_id);
    if (!classData) {
      return response.notFound({ error: `Class ID ${class_id} not found` });
    }

    // Check if seat availability already exists
    const existingAvailability = await ClassSeatAvailability.findBy('class_id', class_id);
    if (existingAvailability) {
      return response.badRequest({ error: `Seat availability already exists for Class ID ${class_id}` });
    }

    // Get quota-allocated seats
    const quotaSeats = await QuotaAllocation.query()
      .where('class_id', class_id)
      .sum('total_seats as total');

    const quota_allocated_seats = quotaSeats[0]?.total_seats || 0;

    // Get filled seats
    const filledSeats = await StudentEnrollments.query()
      .where('class_id', class_id)
      .count('* as total');
    console.log("filledSeats", filledSeats)

    const filled_seats = filledSeats[0]?.$extras.total || 0;

    // Calculate available general seats
    const general_available_seats = total_seats - quota_allocated_seats;
    const remaining_seats = total_seats - filled_seats;

    // Create new seat availability entry
    const seatAvailability = await ClassSeatAvailability.create({
      class_id,
      total_seats,
      academic_session_id,
      quota_allocated_seats,
      general_available_seats,
      filled_seats,
      remaining_seats,
    });

    return response.created({ message: 'Class seat availability added successfully', seatAvailability });
  }

  /**
   * Get all classes seat availability
   */
  public async getAllClassesSeatAvailability(ctx: HttpContext) {

    let academic_session_id = await AcademicSession.query()
    .where('is_active', true)
    .andWhere('school_id', ctx.auth.user!.school_id) 
    .first();

    if(!academic_session_id) {
      return ctx.response.notFound({ error: 'No active academic session found' });
    }

    const classSeatAvailabilities = await ClassSeatAvailability.query()
      .preload('class')
      .preload('quota_allocation')
      .where('academic_session_id', academic_session_id?.id)
      ;

      if (!classSeatAvailabilities.length) {
      return ctx.response.notFound({ error: 'No seat availability data found' });
    }

    return ctx.response.ok(classSeatAvailabilities);
  }

  /**
   * Get seat availability for a specific class
   */
  public async getSeatAvailability({ params, response }: HttpContext) {
    const availability = await ClassSeatAvailability.query()
      .where('class_id', params.class_id)
      .preload('class')
      .preload('quota_allocation')
      .first();

    if (!availability) {
      return response.notFound({ error: `Seat availability data not found for class ID ${params.class_id}` });
    }

    return response.ok(availability);
  }

  /**
   * Update class seat availability for a specific class
   */
  public async updateSeatAvailability({ params, request, response, auth }: HttpContext) {
    try {
      const class_id = Number(params.class_id)
      if (!class_id) {
        return response.badRequest({ message: 'Invalid class ID' })
      }
  
      const total_seats = request.input('total_seats')
      if (!total_seats || isNaN(total_seats)) {
        return response.badRequest({ message: 'Invalid total seats value' })
      }
  
      // Fetch the class
      const classData = await Classes.find(class_id)
      if (!classData) {
        return response.notFound({ message: `Class ID ${class_id} not found` })
      }
  
      // Get current active academic session for school
      const activeSession = await AcademicSession.query()
        .where('is_active', true)
        .andWhere('school_id', auth.user!.school_id)
        .first()
  
      if (!activeSession) {
        return response.notFound({ message: 'No active academic session found for this school' })
      }
  
      const academic_session_id = activeSession.id
  
      // Get total quota-allocated seats
      const quotaSum = await QuotaAllocation.query()
        .where('class_id', class_id)
        .sum('total_seats as total')
  
      const quota_allocated_seats = Number(quotaSum[0]?.$extras.total ?? 0)
  
      // Get filled seats
      const filledSeats = await StudentEnrollments.query()
        .where('class_id', class_id)
        .count('* as total')
  
      const filled_seats = Number(filledSeats[0]?.$extras.total ?? 0)
  
      // Calculate remaining and general seats
      const general_available_seats = total_seats - quota_allocated_seats
      const remaining_seats = total_seats - filled_seats
  
      // Find or create seat availability
      let seatAvailability = await ClassSeatAvailability.query()
        .where('class_id', class_id)
        .where('academic_session_id', academic_session_id)
        .first()
  
      if (!seatAvailability) {
        seatAvailability = new ClassSeatAvailability()
        seatAvailability.class_id = class_id
        seatAvailability.academic_session_id = academic_session_id
      }
  
      // Update values
      seatAvailability.total_seats = total_seats
      seatAvailability.quota_allocated_seats = quota_allocated_seats
      seatAvailability.general_available_seats = general_available_seats
      seatAvailability.filled_seats = filled_seats
      seatAvailability.remaining_seats = remaining_seats
  
      await seatAvailability.save()
  
      return response.ok({
        message: `Seat availability updated for Class ID ${class_id}`,
        seatAvailability,
      })
    } catch (error) {
      console.error('Error updating seat availability:', error)
      return response.internalServerError({
        message: 'Failed to update seat availability',
        error: error.message,
      })
    }
  }  
}
