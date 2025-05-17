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
import GlobalSearchController from '#controllers/GlobalSearchController'
import StudentManagementController from '#controllers/StudentManagementController'
import PayrollController from '#controllers/PayrollController'
import StaffAttendanceController from '#controllers/StaffAttendanceController'
import SubjectController from '#controllers/SubjectController'

router
  .group(() => {
    router.post('/signup', [AuthController, 'createSchool'])
    router.post('/login', [AuthController, 'login'])
    router.post('/reset-password', [AuthController, 'resetPassword'])
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
    router.put('/academic-session/:id', [
      AcademicSessionsController,
      'updateAcademicSessionForSchool',
    ])
    router.get('/academic-sessions/:school_id', [
      AcademicSessionsController,
      'getAllAcademicSessionInSchool',
    ])
    // router.delete('/academic-session/:id', [AcademicSessionsController, 'deleteAcademicSession'])

    router.get('/users', [UsersController, 'indexSchoolUsers'])
    router.post('/user', [UsersController, 'createUser'])
    router.put('/user/:user_id', [UsersController, 'updateUser'])
    router.post('/user/onboard/staff', [UsersController, 'onBoardStaffAsUser'])
    router.put('/user/onboard/staff/:user_id', [UsersController, 'UpdateOnBoardedStaff'])

    router.get('/classes/:school_id', [ClassesController, 'indexClassesForSchool'])
    router.post('/class/base', [ClassesController, 'createClass'])
    router.post('/classes', [ClassesController, 'createMultipleClasses'])
    router.post('/class/division', [ClassesController, 'createDivision'])
    router.put('/class/:division_id', [ClassesController, 'updateClass'])

    // API to get the Global Search Results
    router.get('student/search', [GlobalSearchController, 'getStuentSearchResults'])
    router.get('staff/search', [GlobalSearchController, 'getStaffSearchResults'])

    router.get('students/:academic_session_id/:class_id', [
      StundetsController,
      'indexClassStudents',
    ])
    router.get('student/:student_id', [StundetsController, 'fetchStudent'])
    router.get('student/detail/:student_id', [StundetsController, 'fetchStudentInDetail'])
    router.get('students/:class_id', [StundetsController, 'indexClassStudents'])
    router.get('student/:school_id/:student_id', [StundetsController, 'fetchStudent'])
    router.post('student', [StundetsController, 'createSingleStudent'])
    router.post('students/multiple/:class_id', [StundetsController, 'createMultipleStudents'])
    router.put('student/:student_id', [StundetsController, 'updateStudents'])
    router.post('students/bulk-upload/:academic_session_id/:division_id', [
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
    router.get('staff/:id', [StaffController, 'findStaffById'])
    router.post('staff', [StaffController, 'createStaff'])
    router.put('staff/:staff_id', [StaffController, 'updateStaff'])
    router.post('staff/bulk-upload', [StaffController, 'bulkUploadStaff'])
    router.post('staff/export/:school_id/:academic_session_id/', [StaffController, 'exportToExcel'])

    // Add new routes for leave management
    router
      .group(() => {
        // Leave type and policy routes (existing)
        router.get('leave-type', [LeavesController, 'indexLeaveTypesForSchool'])
        router.post('leave-type', [LeavesController, 'createLeaveTypeForSchool'])
        router.put('leave-type/:leave_type_id', [LeavesController, 'updateLeaveTypeForSchool'])
        router.get('leave-policy', [LeavesController, 'indexLeavePolicyForSchool'])
        router.get('leave-policy/user', [LeavesController, 'indexLeavePolicyForUser'])
        router.post('leave-policy', [LeavesController, 'createLeavePolicyForSchool'])
        router.put('leave-policy/:leave_policy_id', [
          LeavesController,
          'updateLeavePolicyForSchool',
        ])

        // Enhanced leave management routes
        router.get('leave-applications/:staff_id', [LeavesController, 'fetchLeaveApplication'])
        router.get('leave-applications', [LeavesController, 'fetchLeaveApplicationForAdmin'])
        router.post('leave-application', [LeavesController, 'applyForLeave'])
        router.put('leave-application/:uuid', [LeavesController, 'updateAppliedLeave'])
        router.put('leave-application/withdraw/:uuid', [
          LeavesController,
          'withdrawLeaveApplication',
        ])
        router.put('leave-application/status/:uuid', [
          LeavesController,
          'approveTeachersLeaveApplication',
        ])

        // New routes for enhanced functionality
        router.get('leave-balances/:staff_id', [LeavesController, 'fetchStaffLeaveBalances'])
        router.get('leave-logs/:id', [LeavesController, 'getLeaveApplicationLogs'])
        router.post('leave/staff/search', [LeavesController, 'searchStaff'])
        router.post('leave/carry-forward', [LeavesController, 'processLeaveCarryForward'])
      })
      .use(middleware.auth())

    // payroll
    router.get('/payroll/salary-component', [PayrollController, 'indexSalaryComponents'])
    router.post('/payroll/salary-component', [PayrollController, 'createSalaryComponent'])
    router.put('/payroll/salary-component/:component_id', [
      PayrollController,
      'updateSalaryComponent',
    ])
    router.delete('/payroll/salary-component/:component_id', [
      PayrollController,
      'deleteSalaryComponent',
    ])

    router.get('/payroll/salary-template', [PayrollController, 'indexSalaryTemplates'])
    router.get('/payroll/salary-template/:template_id', [
      PayrollController,
      'fetchSingleSalaryTemplate',
    ])
    router.post('/payroll/salary-template', [PayrollController, 'createSalaryTemplate'])
    router.put('/payroll/salary-template/:template_id', [PayrollController, 'updateSalaryTemplate'])

    router.get('/payroll/staff-salary-template/:staff_id', [
      PayrollController,
      'fetchSalaryTemplateForSingleStaff',
    ])
    router.post('/payroll/staff-salary-template', [PayrollController, 'createStaffSalaryTemplate'])
    router.put('/payroll/staff-salary-template/:staff_id/:template_id', [
      PayrollController,
      'updateStaffSalaryTemplate',
    ])

    router.get('/payroll/staff', [PayrollController, 'fetchStaffWithSalaryTemplates'])
    router.post('/payroll/payrun', [PayrollController, 'createPayRunForStaff'])
    router.put('payroll/payrun/:staff_id/:payrun_template_id', [
      PayrollController,
      'udpdatePayRunTemplate',
    ])

    // routes for the class seat availability
    router.post('/classes/seats', [ClassSeatAvailabilitiesController, 'addSeatAvailability'])
    router.get('/classes/seats/all', [
      ClassSeatAvailabilitiesController,
      'getAllClassesSeatAvailability',
    ])
    router.get('/classes/seats/:class_id', [
      ClassSeatAvailabilitiesController,
      'getSeatAvailability',
    ])
    router.put('/classes/seats/:class_id', [
      ClassSeatAvailabilitiesController,
      'updateSeatAvailability',
    ])

    // routes for the quota
    router.post('/quota', [QuotasController, 'createQuotaForSeats'])
    router.get('/quota/all', [QuotasController, 'listAllQuotas'])
    router.put('/quota/:id', [QuotasController, 'updateQuota'])
    router.delete('/quota/:id', [QuotasController, 'delete'])

    // routes for the quota allocation
    router.post('/quota-allocation/', [QuotaAllocationsController, 'allocateQuotaToClass'])
    // router.get('/quota-allocation/all', [QuotaAllocationsController, 'listAllQuotaAllocation'])
    router.put('/quota-allocation/:quota_allocation_id', [
      QuotaAllocationsController,
      'updateTotalSeats',
    ])

    router.get('attendance/:class_id/:unix_date', [AttendanceController, 'getAttendanceDetails'])
    router.post('attendance', [AttendanceController, 'markAttendance'])

    /**Fees */

    router.get('/feestype', [FeesController, 'indexFeesTyeForSchool'])
    router.get('/feestype/filter', [FeesController, 'indexFeesTypeByFilter'])
    router.post('/feestype', [FeesController, 'createFeesType'])
    router.put('/feestype/:id', [FeesController, 'updateFeesType'])
    router.get('/feesplan', [FeesController, 'indexFeesPlanForSchool'])
    router.get('/feesplan/status/:plan_id/:status', [FeesController, 'updateFeesPlanStatus'])
    router.get('/feesplan/detail/:plan_id', [FeesController, 'fetchFeesPlanDetails'])
    router.post('/feesplan', [FeesController, 'createFeePlan'])
    router.post('/feesplan/applyextrafees', [FeesController, 'applyFeesTypeToStudentFeesPlan'])
    router.put('/feesplan/:plan_id', [FeesController, 'updatePlan'])

    router.get('/fees/status/class/:division_id', [FeesController, 'fetchFeesStatusForClass'])
    router.get('/fees/status/student/:student_id', [
      FeesController,
      'fetchFeesStatusForSingleStudent',
    ])
    // router.post('/fees/pay/:student_id', [FeesController, 'payFees'])
    router.post('/fees/pay/installments', [FeesController, 'payMultipleInstallments'])
    router.put('/transaction/:transaction_id', [FeesController, 'updateFeesStatus'])

    /**concessions */
    router.get('/concessions', [FeesController, 'indexConcessionType'])
    router.get('/concessions/all', [FeesController, 'indexAllConcessionType'])
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
    router.post('/inquiry/convert/:inquiry_id', [InquiriesController, 'convertInquiryToStudent'])

    router.get('admissions/dashboard', [AdmissionDashboardController, 'getDashboardData'])
    router.get('admissions/dashboard/detailed', [
      AdmissionDashboardController,
      'getDetailedStatistics',
    ])
    router.get('admissions/dashboard/trends', [AdmissionDashboardController, 'getTrendData'])

    // Student Mangement --- Permotion, demotion, and drop and transfer
    // Get students eligible for promotion
    router.post('/students-for-permotion', [StudentManagementController, 'getStudentsForPromotion'])
    router.post('/promote-students', [StudentManagementController, 'promote'])
    router.post('/bulk-promote', [StudentManagementController, 'bulkPromote'])
    router.post('/hold-back-student', [StudentManagementController, 'holdBackStudent'])
    router.post('/bulk-hold-back-students', [StudentManagementController, 'bulkHoldBackStudents'])
    router.get('/promotion-history/:academic_session_id', [
      StudentManagementController,
      'getPromotionHistory',
    ])

    router.get('/management/students/:division_id' , [StudentManagementController , 'indexStudentForManagement'])
    router.post('/management/student/migrate/:student_enrollment_id' , [StudentManagementController , 'updateEnrollmentStatusToMigrate'])
    router.post('/management/student/complete/:student_enrollment_id' , [StudentManagementController , 'updateEnrollmentStatusToComplete'])
    router.post('/management/student/suspend/:student_enrollment_id' , [StudentManagementController , 'updateEnrollmentStatusToSuspended'])
    router.post('/management/student/drop/:student_enrollment_id' , [StudentManagementController , 'updateEnrollmentStatusToDrop'])


    router.get('subjects', [SubjectController, 'indexSubjects'])
    router.post('subject', [SubjectController, 'createSubject'])
    router.get('subjects/division/:division_id', [SubjectController, 'indexSubjectsForDivision'])
    // router.put('subject/:subject_id', [SubjectController, 'updateSubject'])
    router.post('subject/assign', [SubjectController, 'assignSubjectToDivision'])
    router.post('subject/assign/staffs', [SubjectController, 'assignStaffToSubject'])


    router.post('staff-attendance/check-in', [StaffAttendanceController, 'checkIn'])
    router.post('staff-attendance/check-out', [StaffAttendanceController, 'checkOut'])
    router.post('staff-attendance/edit-request', [StaffAttendanceController, 'requestEdit'])

    // Admin functions
    router.post('staff-attendance/admin-mark', [StaffAttendanceController, 'adminMarkAttendance'])
    router.put('staff-attendance/edit-request/:id', [
      StaffAttendanceController,
      'processEditRequest',
    ])
    router.get('staff-attendance/edit-requests', [StaffAttendanceController, 'getEditRequests'])

    // View attendance
    router.get('staff-attendance/:staff_id', [StaffAttendanceController, 'getStaffAttendance'])
  })
  .prefix('/api/v1/')
  .use(middleware.auth())
