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
  public async getAllClassesSeatAvailability({ response }: HttpContext) {
    const classSeatAvailabilities = await ClassSeatAvailability.query()
      .preload('class')
      .preload('quota_allocation');

      if (!classSeatAvailabilities.length) {
      return response.notFound({ error: 'No seat availability data found' });
    }

    return response.ok(classSeatAvailabilities);
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
  // public async updateSeatAvailability({ params, request, response }: HttpContext) {
  //   const classWithSeats = await ClassSeatAvailability.query()
  //     .where('id', params.class_id)
  //     .preload('seat_availability'); // Ensure this relation exists
  
  //   const totalSeats = classWithSeats. || 0;

  //   // Get quota-allocated seats
  //   const quotaSeats = await QuotaAllocation.query()
  //     .where('class_id', classData.id)
  //     .sum('total_seats as total');

  //   const quota_allocated_seats = quotaSeats[0]?.total || 0;

  //   // Get filled seats
  //   const filledSeats = await StudentEnrollments.query()
  //     .where('class_id', classData.id)
  //     .count('* as total');

  //   const filled_seats = filledSeats[0]?.total || 0;

  //   // Calculate available general seats
  //   const general_available_seats = total_seats - quota_allocated_seats;
  //   const remaining_seats = total_seats - filled_seats;

  //   // Update or create record in ClassSeatAvailability table
  //   let seatAvailability = await ClassSeatAvailability.findBy('class_id', classData.id);
  //   if (!seatAvailability) {
  //     seatAvailability = new ClassSeatAvailability();
  //     seatAvailability.class_id = classData.id;
  //   }

  //   seatAvailability.total_seats = total_seats;
  //   seatAvailability.quota_allocated_seats = quota_allocated_seats;
  //   seatAvailability.general_available_seats = general_available_seats;
  //   seatAvailability.filled_seats = filled_seats;
  //   seatAvailability.remaining_seats = remaining_seats;

  //   await seatAvailability.save();

  //   return response.ok({ message: `Seat availability updated for class ID ${classData.id}`, seatAvailability });
  // }
}
