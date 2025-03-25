/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'
import { middleware } from './kernel.js'
import AuthController from '#controllers/AuthController'
import ClassesController from '#controllers/ClassesController'
import UsersController from '#controllers/UsersController'
import StundetsController from '#controllers/StudentController'
import StaffMasterController from '#controllers/StaffMasterController'
import SchoolsController from '#controllers/SchoolsController'
import LeavesController from '#controllers/LeavesController'
import AttendanceController from '#controllers/AttendancesController'
import InquiriesController from '#controllers/InquiriesController'
import FeesController from '#controllers/FeesController'
import OrganizationController from '#controllers/OrganizationController'
import AcademicSessionsController from '#controllers/AcademicSessionController'
import StaffController from '#controllers/StaffController'
import ClassSeatAvailabilitiesController from '#controllers/ClassSeatAvailabilitiesController'
import QuotasController from '#controllers/QuotaController'
import QuotaAllocationsController from '#controllers/QuotaAllocationController'
import AdmissionDashboardController from '#controllers/AdmissionDashboardController'

router
  .group(() => {
    router.post('/signup', [AuthController, 'createSchool'])
    router.post('/login', [AuthController, 'login'])
    router.get('/organizations', [OrganizationController, 'getAllOrganization'])
    router.post('/onboard-organization', [OrganizationController, 'onboardOrganization'])
    router.get('/organization/:id', [OrganizationController, 'getOrganizationById'])
    router.put('/organization/:id', [OrganizationController, 'updateOrganizationById'])
  })
  .prefix('/api/v1/')

router
  .group(() => {
    router.get('/verify', [AuthController, 'verifyUser'])
    router.get('/logout', [AuthController, 'logout'])

    router.get('/stats', [SchoolsController, 'fetchSchoolDataForDashBoard'])
    router.get('/school/:school_id', [SchoolsController, 'index'])
    router.put('/school/:school_id', [SchoolsController, 'update'])

    router.post('/academic-session', [AcademicSessionsController, 'createAcademicSessionForSchool'])
    router.put('/academic-session/:school_id', [
      AcademicSessionsController,
      'updateAcademicSessionForSchool',
    ])
    router.get('/academic-sessions/:school_id', [
      AcademicSessionsController,
      'getAllAcademicSessionInSchool',
    ])

    router.get('/users', [UsersController, 'indexSchoolUsers'])
    router.post('/user', [UsersController, 'createUser'])
    router.put('/user/:user_id', [UsersController, 'updateUser'])
    router.post('/user/onboard/staff', [UsersController, 'onBoardStaffAsUser'])
    router.put('/user/onboard/staff/:user_id', [UsersController, 'UpdateOnBoardedStaff'])

    router.get('/classes/:school_id', [ClassesController, 'indexClassesForSchool'])
    router.post('/class/base', [ClassesController, 'createClass'])
    router.post('/classes', [ClassesController, 'createMultipleClasses'])
    router.post('/class/division', [ClassesController, 'createDivision'])
    router.put('/class/:class_id', [ClassesController, 'updateClass'])

    router.get('students/:academic_session_id/:class_id', [
      StundetsController,
      'indexClassStudents',
    ])
    router.get('student/:student_id', [StundetsController, 'fetchStudent'])
    router.get('students/:class_id', [StundetsController, 'indexClassStudents'])
    router.get('student/:school_id/:student_id', [StundetsController, 'fetchStudent'])
    router.post('student', [StundetsController, 'createSingleStudent'])
    router.post('students/multiple/:class_id', [StundetsController, 'createMultipleStudents'])
    router.put('student/:student_id', [StundetsController, 'updateStudents'])
    router.post('students/bulk-upload/:school_id/:academic_session_id/:class_id', [
      StundetsController,
      'bulkUploadStudents',
    ])
    router.post('students/export/:academic_session_id/:class_id', [
      StundetsController,
      'exportToExcel',
    ])

    router.get('/staff-role/:school_id', [StaffMasterController, 'indexStaffMasterForSchool'])
    router.post('/staff-role', [StaffMasterController, 'createStaffRole'])
    router.put('/staff-role/:id', [StaffMasterController, 'updateStaffRole'])
    router.delete('/staff-role/:id', [StaffMasterController, 'deleteStaffRole'])

    router.get('staff', [StaffController, 'indexStaff'])
    // router.get('staff/activeuser', [StaffController, 'indexTeacherActiveAsUser'])
    router.post('staff', [StaffController, 'createStaff'])
    router.put('staff/:staff_id', [StaffController, 'updateStaff'])
    router.post('staff/bulk-upload', [StaffController, 'bulkUploadStaff'])
    router.post('staff/export/:school_id/:academic_session_id/', [StaffController, 'exportToExcel'])

    router.get('leave-type', [LeavesController, 'indexLeaveTypesForSchool'])
    router.post('leave-type', [LeavesController, 'createLeaveTypeForSchool'])
    router.put('leave-type/:leave_type_id', [LeavesController, 'updateLeaveTypeForSchool'])
    router.get('leave-policy', [LeavesController, 'indexLeavePolicyForSchool'])
    router.get('leave-policy/user', [LeavesController, 'indexLeavePolicyForUser'])
    router.post('leave-policy', [LeavesController, 'createLeavePolicyForSchool'])
    router.put('leave-policy/:leave_policy_id', [LeavesController, 'updateLeavePolicyForSchool'])

    router.get('leave-applications/:staff_id', [LeavesController, 'fetchLeaveApplication'])
    router.get('leave-applications', [LeavesController, 'fetchLeaveApplicationForAdmin'])
    router.post('leave-application', [LeavesController, 'applyForLeave'])
    router.put('leave-application/:uuid', [LeavesController, 'updateAppliedLeave'])
    router.put('/leave-application/status/:uuid', [
      LeavesController,
      'approveTeachersLeaveApplication',
    ])

    // routes for the class seat availability
    router.post('/classes/seat-availability', [
      ClassSeatAvailabilitiesController,
      'addSeatAvailability',
    ])
    router.get('/classes/seat-availability/all', [
      ClassSeatAvailabilitiesController,
      'getAllClassesSeatAvailability',
    ])
    router.get('/classes/:class_id/seat-availability', [
      ClassSeatAvailabilitiesController,
      'getSeatAvailability',
    ])
    // router.put('/classes/:class_id/update-seat-availability', [ClassSeatAvailabilitiesController,'updateSeatAvailability']);

    // routes for the quota
    router.post('/quota', [QuotasController, 'createQuotaForSeats'])
    router.get('/quota/all', [QuotasController, 'listAllQuotas'])
    router.put('/quota/:id', [QuotasController, 'updateQuota'])
    router.delete('/quota/:id', [QuotasController, 'delete'])

    // routes for the quota allocation
    router.post('/quota-allocation/', [QuotaAllocationsController, 'allocateQuotaToClass'])
    router.get('/quota-allocation/all', [QuotaAllocationsController, 'listAllQuotaAllocation'])
    router.put('/quota-allocation/:id', [QuotaAllocationsController, 'updateFilledSeats'])

    router.get('attendance/:class_id/:unix_date', [AttendanceController, 'getAttendanceDetails'])
    router.post('attendance', [AttendanceController, 'markAttendance'])

    /**Fees */

    router.get('/feestype', [FeesController, 'indexFeesTyeForSchool'])
    router.post('/feestype', [FeesController, 'createFeesType'])
    router.put('/feestype/:id', [FeesController, 'updateFeesType'])
    router.get('/feesplan', [FeesController, 'indexFeesPlanForSchool'])
    router.get('/feesplan/detail/:plan_id', [FeesController, 'fetchFeesPlanDetails'])
    router.post('/feesplan', [FeesController, 'createFeePlan'])
    router.put('/feesplan/:plan_id', [FeesController, 'updatePlan'])

    router.get('/fees/status/class/:class_id', [FeesController, 'fetchFeesStatusForClass'])
    router.get('/fees/status/student/:student_id', [
      FeesController,
      'fetchFeesStatusForSingleStudent',
    ])
    // router.post('/fees/pay/:student_id', [FeesController, 'payFees'])
    router.post('/fees/pay/installments', [FeesController, 'payMultipleInstallments'])
    router.put('/transaction/:transaction_id', [FeesController, 'updateFeesStatus'])

    /**concessions */
    router.get('/concessions', [FeesController, 'indexConcessionType'])
    router.get('/concession/:concession_id', [FeesController, 'fetchDetailConcessionType'])
    router.post('/concession', [FeesController, 'createConcession'])
    router.put('/concession/:concession_id', [FeesController, 'updateConcession'])
    router.post('/concession/apply/plan', [FeesController, 'applyConcessionToPlan'])
    router.put('/concession/plan/:concession_id/:plan_id', [
      FeesController,
      'updateAppliedConcessionToPlan',
    ])
    router.post('/concession/apply/student', [FeesController, 'applyConcessionToStudent'])
    router.put('/concession/student/:concession_id/:plan_id/:student_id', [
      FeesController,
      'updateConcessionAppliedToStudent',
    ])

    router.get('/inquiries', [InquiriesController, 'listAllInquiries'])
    router.post('/inquiry', [InquiriesController, 'addInquiryForClass'])
    router.get('/inquiry/:id', [InquiriesController, 'getInquiryById'])
    router.put('/inquiry/:id', [InquiriesController, 'updateInquiry'])
    router.post('/inquiry/:id/enroll-student', [InquiriesController, 'convertInquiryToStudent'])

    router.get('admissions/dashboard', [AdmissionDashboardController, 'getDashboardData'])
    router.get('admissions/dashboard/detailed', [
      AdmissionDashboardController,
      'getDetailedStatistics',
    ])
    router.get('admissions/dashboard/trends', [AdmissionDashboardController, 'getTrendData'])
  })
  .prefix('/api/v1/')
  .use(middleware.auth())
