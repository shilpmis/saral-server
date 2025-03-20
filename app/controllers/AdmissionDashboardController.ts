import AdmissionInquiry from '#models/Inquiries'
import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'

export default class AdmissionDashboardController {
    
  public async getDashboardData({ response, auth }: HttpContext) {
    try {
      // Get the authenticated user's school_id (assuming the user is authenticated)
      const userId = auth.user?.id
      const schoolId = auth.user?.school_id

      // Base query to filter by school if needed
      const baseQuery = schoolId ? AdmissionInquiry.query().where('school_id', schoolId) : AdmissionInquiry.query()

      // Get total inquiries
      const totalInquiries = await baseQuery.clone().count('* as total')
      
      // Get pending applications
      const pendingApplications = await baseQuery.clone()
        .where('status', 'pending')
        .count('* as total')
      
      // Get accepted admissions (approved, admitted)
      const acceptedAdmissions = await baseQuery.clone()
        .whereIn('status', ['approved', 'admitted'])
        .count('* as total')
      
      // Get upcoming interviews
      const upcomingInterviews = await baseQuery.clone()
        .where('status', 'interview scheduled')
        .count('* as total')
      
      // Prepare the dashboard data
      const dashboardData = {
        totalInquiries: Number(totalInquiries[0]?.$extras.total || 0),
        pendingApplications: Number(pendingApplications[0]?.$extras.total || 0),
        acceptedAdmissions: Number(acceptedAdmissions[0]?.$extras.total || 0),
        upcomingInterviews: Number(upcomingInterviews[0]?.$extras.total || 0)
      }

      return response.ok(dashboardData)
    } catch (error) {
      console.error('Error fetching admission dashboard data:', error)
      return response.internalServerError({
        message: 'Failed to fetch dashboard data',
        error: error.message
      })
    }
  }

  /**
   * Get detailed admission statistics by status
   */
  public async getDetailedStatistics({ response, auth }: HttpContext) {
    try {
      const schoolId = auth.user?.school_id

      // Base query to filter by school if needed
      const baseQuery = schoolId ? AdmissionInquiry.query().where('school_id', schoolId) : AdmissionInquiry.query()

      // Get counts for each status
      const statusCounts = await baseQuery
        .select('status')
        .count('* as count')
        .groupBy('status')

      // Transform the results into a more usable format
      const statusStats: Record<string, number> = {}
      statusCounts.forEach(item => {
        statusStats[item.status] = Number(item.$extras.count || 0)
      })

      return response.ok(statusStats)
    } catch (error) {
      console.error('Error fetching detailed admission statistics:', error)
      return response.internalServerError({
        message: 'Failed to fetch detailed statistics',
        error: error.message
      })
    }
  }

  /**
   * Get trend data for admissions over time
   */
  public async getTrendData({ request, response, auth }: HttpContext) {
    try {
      const { period = 'month', limit = 6 } = request.qs()
      const schoolId = auth.user?.school_id

      // Define the date format based on the requested period
      let dateFormat
      switch (period) {
        case 'day':
          dateFormat = '%Y-%m-%d'
          break
        case 'week':
          dateFormat = '%x-%v' // ISO year and week number
          break
        case 'month':
        default:
          dateFormat = '%Y-%m'
          break
      }

      // Base query
      const baseQuery = AdmissionInquiry.query()
      if (schoolId) {
        baseQuery.where('school_id', schoolId)
      }

      // Get trend data
      const trendData = await baseQuery
        .select(
          db.rawQuery(`DATE_FORMAT(created_at, '${dateFormat}') as time_period`),
          db.rawQuery('COUNT(*) as count')
        )
        .groupByRaw(`DATE_FORMAT(created_at, '${dateFormat}')`)
        .orderBy('time_period', 'desc')
        .limit(limit)

      return response.ok(trendData.reverse()) // Reverse to get chronological order
    } catch (error) {
      console.error('Error fetching admission trend data:', error)
      return response.internalServerError({
        message: 'Failed to fetch trend data',
        error: error.message
      })
    }
  }
}