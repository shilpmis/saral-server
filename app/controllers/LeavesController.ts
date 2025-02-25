import LeavePolicies from '#models/LeavePolicies';
import LeaveTypeMaster from '#models/LeaveTypeMaster';
import OtherStaff from '#models/OtherStaff';
import OtherStaffLeaveApplication from '#models/OtherStaffLeaveApplication';
import StaffMaster from '#models/StaffMaster';
import Teacher from '#models/Teacher';
import TeacherLeaveApplication from '#models/TeacherLeaveApplication';
import { CreateValidatorForLeavePolicies, CreateValidatorForLeaveType, CreateValidatorForOtherStaffLeaveApplication, CreateValidatorForTeachersLeaveApplication, UpdateValidatorForLeavePolicies, UpdateValidatorForLeaveType, UpdateValidatorForOtherStaffLeaveApplication, UpdateValidatorForTeachersLeaveApplication } from '#validators/Leave';
import { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db';
import { DateTime } from 'luxon';
import { v4 as uuidv4 } from 'uuid';


export default class LeavesController {

    async createLeaveTypeForSchool(ctx: HttpContext) {

        let school_id = ctx.auth.user!.school_id;
        let role_id = ctx.auth.user!.role_id

        if (role_id !== 1) {
            return ctx.response.status(401).json({
                message: "You are not authorized to create leave type for this school"
            })
        }

        let paylaod = await CreateValidatorForLeaveType.validate(ctx.request.body());
        let leave = await LeaveTypeMaster.create({ ...paylaod, school_id: school_id });
        return ctx.response.status(201).json(leave);
    }

    async updateLeaveTypeForSchool(ctx: HttpContext) {

        let school_id = ctx.auth.user!.school_id;
        let role_id = ctx.auth.user!.role_id

        if (role_id !== 1 && school_id !== ctx.auth.user?.school_id) {
            return ctx.response.status(401).json({
                message: "You are not authorized to create leave type for this school"
            })
        }

        let leave_type = await LeaveTypeMaster
            .query()
            .where('id', ctx.params.leave_type_id)
            .andWhere('school_id', school_id).first();

        if (!leave_type) {
            return ctx.response.status(404).json({
                message: "This leave type is not available for your school"
            })
        }

        let payload = await UpdateValidatorForLeaveType.validate(ctx.request.body())
        await leave_type.merge(payload).save();

        return ctx.response.status(200).json(leave_type);

    }

    async createLeavePolicyForSchool(ctx: HttpContext) {

        let role_id = ctx.auth.user!.role_id

        if (role_id !== 1) {
            return ctx.response.status(401).json({
                message: "You are not authorized to create leave type for this school"
            })
        }

        let paylaod = await CreateValidatorForLeavePolicies.validate(ctx.request.body());

        let leave_type = await LeaveTypeMaster
            .query()
            .where('id', paylaod.leave_type_id)
            .andWhere('school_id', ctx.auth.user!.school_id).first();

        if (!leave_type) {
            return ctx.response.status(404).json({
                message: "This leave type is not available for your school"
            })
        }

        let leave = await LeavePolicies.create(paylaod);

        return ctx.response.status(200).json(leave);

    }

    async updateLeavePolicyForSchool(ctx: HttpContext) {

        let role_id = ctx.auth.user!.role_id

        if (role_id !== 1) {
            return ctx.response.status(401).json({
                message: "You are not authorized to create leave type for this school"
            })
        }


        let leave_policy = await LeavePolicies
            .query()
            .where('id', ctx.params.leave_policy_id).first();

        if (!leave_policy) {
            return ctx.response.status(404).json({
                message: "This leave policy is not available for your school"
            })
        }

        let validate_leave = await LeaveTypeMaster
            .query()
            .where('id', leave_policy!.leave_type_id)
            .andWhere('school_id', ctx.auth.user!.school_id).first();

        if (!validate_leave) {
            return ctx.response.status(401).json({
                message: "This leave policy is not available for your school"
            })
        }

        let payload = await UpdateValidatorForLeavePolicies.validate(ctx.request.body());

        await leave_policy.merge(payload).save();

        return ctx.response.status(200).json(leave_policy);
    }

    private async validateLeaveRequest(
        payload: any,
        leavePolicy: LeavePolicies,
    ) {

        let numberOfDays = 0;

        const startDate = DateTime.fromJSDate(new Date(payload.from_date));
        const endDate = DateTime.fromJSDate(new Date(payload!.to_date));
        const today = DateTime.now().startOf('day');
        const twoMonthsFromNow = today.plus({ months: 2 });

        // 1. Date validations
        if (startDate < today) {
            throw new Error("Leave cannot be applied for past dates");
        }

        if (startDate > endDate) {
            throw new Error("Start date cannot be greater than end date");
        }

        if (endDate > twoMonthsFromNow) {
            throw new Error("Cannot apply leave for more than 2 months in advance");
        }


        if (payload.is_hourly_leave) {
            // 3 & 4 & 5. Hourly leave validations
            console.log("CHECK THIS DATA" , startDate ,endDate)
            if (!startDate.equals(endDate)) {
                throw new Error("For hourly leave, start and end date must be same");
            }
            if (payload.is_half_day || payload.half_day_type !== 'none') {
                throw new Error("Hourly leave cannot be combined with half day");
            }
            if (!payload.total_hour) {
                throw new Error("Total hour should be there if leave is hour based .");
            }
            if (payload.total_hour > 4) {
                throw new Error("Hourly leave cannot exceed 4 hours");
            }
            numberOfDays = payload.total_hour / leavePolicy.staff_role.working_hours; // Converting hours to days

        } else if (payload.is_half_day) {
            // 3 & 4. Half day validations
            if (!startDate.equals(endDate)) {
                throw new Error("For half day leave, start and end date must be same");
            }
            if (payload.half_day_type === 'none') {
                throw new Error("Half day type must be specified for half day leave");
            }
            numberOfDays = 0.5;

        } else {
            // Calculate business days excluding weekends
            let current = startDate;
            while (current <= endDate) {
                if (current.weekday <= 5) { // Monday = 1, Friday = 5
                    numberOfDays++;
                }
                current = current.plus({ days: 1 });
            }
        }

        // Validate against max consecutive days
        if (numberOfDays > leavePolicy.max_consecutive_days) {
            throw new Error(`Leave cannot exceed ${leavePolicy.max_consecutive_days} consecutive days`);
        }

        if (!payload.is_hourly_leave && payload.total_hour) {
            throw new Error("Total hour should be null if leave is not hour based !");
        }

        return numberOfDays;
    }

    private async validateLeaveRequestForUpdate(
        existingLeave: any,
        updatedPayload: any,
        leavePolicy: LeavePolicies,
    ) {

        let numberOfDays = 0;

        // Merge existing and updated data
        const payload = {
            ...existingLeave,
            ...updatedPayload
        };

        const startDate = DateTime.fromJSDate(new Date(payload.from_date));
        const endDate = DateTime.fromJSDate(new Date(payload.to_date));
        const today = DateTime.now().startOf('day');
        const twoMonthsFromNow = today.plus({ months: 2 });

        // Only validate dates if they are being updated
        if (updatedPayload.from_date || updatedPayload.to_date) {
            // Allow editing past leaves that were already approved
            if (existingLeave.status !== 'approved') {
                if (startDate < today) {
                    throw new Error("Leave cannot be modified for past dates");
                }
            }

            if (startDate > endDate) {
                throw new Error("Start date cannot be greater than end date");
            }

            if (endDate > twoMonthsFromNow) {
                throw new Error("Cannot apply leave for more than 2 months in advance");
            }
        }


        if (payload.is_hourly_leave) {
            // Hourly leave validations
            if (!startDate.equals(endDate)) {
                throw new Error("For hourly leave, start and end date must be same");
            }
            if (payload.is_half_day || payload.half_day_type !== 'none') {
                throw new Error("Hourly leave cannot be combined with half day");
            }
            if (!payload.total_hour) {
                throw new Error("Total hour should be there if leave is hour based");
            }
            if (payload.total_hour > 4) {
                throw new Error("Hourly leave cannot exceed 4 hours");
            }
            numberOfDays = payload.total_hour / leavePolicy.staff_role.working_hours;

        } else if (payload.is_half_day) {
            // Half day validations  
            if (!startDate.equals(endDate)) {
                throw new Error("For half day leave, start and end date must be same");
            }
            if (payload.half_day_type === 'none') {
                throw new Error("Half day type must be specified for half day leave");
            }
            numberOfDays = 0.5;

        } else {
            // Calculate business days excluding weekends
            let current = startDate;
            while (current <= endDate) {
                if (current.weekday <= 5) {
                    numberOfDays++;
                }
                current = current.plus({ days: 1 });
            }
        }

        // Validate against max consecutive days
        if (numberOfDays > leavePolicy.max_consecutive_days) {
            throw new Error(`Leave cannot exceed ${leavePolicy.max_consecutive_days} consecutive days`);
        }

        if (!payload.is_hourly_leave && payload.total_hour) {
            throw new Error("Total hour should be null if leave is not hour based!");
        }

        // Additional update specific validations
        if (existingLeave.status === 'approved' || existingLeave.status === 'rejected') {
            throw new Error("Cannot modify an approved or rejected leave application");
        }

        return numberOfDays;
    }


    async applyForLeave(ctx: HttpContext) {
        let numberOfDays: any = 0;
        let staff_type = ctx.request.input('staff');
        try {

            if (staff_type === 'teachers') {

                let payload = await CreateValidatorForTeachersLeaveApplication.validate(ctx.request.body());

                /***
                 * need to check leave balance for this type here ! 
                 */


                let teacher = await Teacher.query()
                    .where('id', payload.teacher_id)
                    .andWhere('school_id', ctx.auth.user!.school_id)
                    .first();

                if (!teacher) {
                    return ctx.response.status(401).json({
                        message: "You are not authorized to create leave type for this school"
                    });
                }

                // Validate leave type
                let leave_type = await LeaveTypeMaster.query()
                    .where('id', payload.leave_type_id)
                    .andWhere('school_id', ctx.auth.user!.school_id)
                    .first();

                if (!leave_type) {
                    return ctx.response.status(404).json({
                        message: "This leave type is not available for your school"
                    });
                }

                // Get leave policy
                const leavePolicy = await LeavePolicies.query()
                    .preload('staff_role')
                    .where('staff_role_id', teacher.staff_role_id)
                    .andWhere('leave_type_id', payload.leave_type_id)
                    .first();

                console.log("check this here", teacher.staff_role_id, payload.leave_type_id)

                if (!leavePolicy) {
                    return ctx.response.status(404).json({
                        message: "No leave policy found for this leave type"
                    });
                }

                try {
                    numberOfDays = await this.validateLeaveRequest(payload, leavePolicy);
                } catch (error) {
                    return ctx.response.status(404).json({
                        message: error.message
                    })
                }
                // Validate leave request and calculate days

                const trx = await db.transaction();
                try {
                    const applicationId = uuidv4();
                    let applied_by = ctx.auth.user?.id;

                    let application = await TeacherLeaveApplication.create({
                        ...payload,
                        uuid: applicationId,
                        status: 'pending',
                        number_of_days: numberOfDays || 0,
                        applied_by_self: ctx.auth.user!.is_teacher,
                        applied_by: applied_by
                    }, { client: trx });


                    await trx.commit();

                    return ctx.response.status(201).json(application);

                } catch (error) {
                    await trx.rollback();
                    return ctx.response.status(500).json({
                        message: error.message
                    });
                }

            } else if (staff_type === 'others') {

                let payload = await CreateValidatorForOtherStaffLeaveApplication.validate(ctx.request.body());

                // Similar validation logic for other staff...
                let staff = await OtherStaff.query()
                    .where('id', payload.other_staff_id)
                    .andWhere('school_id', ctx.auth.user!.school_id)
                    .first();

                if (!staff) {
                    return ctx.response.status(401).json({
                        message: "You are not authorized to create leave type for this school"
                    });
                }

                let leave_type = await LeaveTypeMaster.query()
                    .where('id', payload.leave_type_id)
                    .andWhere('school_id', ctx.auth.user!.school_id)
                    .first();

                if (!leave_type) {
                    return ctx.response.status(404).json({
                        message: "This leave type is not available for your school"
                    });
                }

                const leavePolicy = await LeavePolicies.query()
                    .where('staff_role_id', staff.staff_role_id)
                    .where('leave_type_id', payload.leave_type_id)
                    .first();

                if (!leavePolicy) {
                    return ctx.response.status(404).json({
                        message: "No leave policy found for this leave type"
                    });
                }

                try {
                    numberOfDays = await this.validateLeaveRequest(payload, leavePolicy);
                } catch (error) {
                    return ctx.response.status(404).json({
                        message: error.message
                    })
                }

                // const numberOfDays = await this.validateLeaveRequest(ctx, payload, leavePolicy);
                const trx = await db.transaction();
                try {
                    const applicationId = uuidv4();
                    let application = await OtherStaffLeaveApplication.create({
                        ...payload,
                        uuid: applicationId,
                        status: 'pending',
                        number_of_days: numberOfDays || 0,
                        applied_by_self: false,
                        applied_by: ctx.auth.user?.id
                    }, { client: trx });

                    await trx.commit();

                    return ctx.response.status(201).json(application);
                } catch (error) {
                    await trx.rollback();

                    return ctx.response.status(500).json({
                        message: error.message
                    });
                }

            } else {
                return ctx.response.status(404).json({
                    message: "You need to define role correctly!"
                });
            }

        } catch (error) {
            // console.log("error==>" , error);
            return ctx.response.status(400).json(error);
        }
    }

    async updateAppliedLeave(ctx: HttpContext) {

        let leave_application_id = ctx.params.uuid;
        let staff_type = ctx.request.input('staff_type');

        let numberOfDays: any = 0

        if (staff_type === "teaching") {

            let applcation = await TeacherLeaveApplication.query().where('uuid', leave_application_id).first();

            if (!applcation) {
                return ctx.response.status(404).json({
                    message: "Leave application you are requesting is not available"
                })
            }

            let paylaod = await UpdateValidatorForTeachersLeaveApplication.validate(ctx.request.body());
            
            // Teacher for staff id 

            let teacher = await Teacher.query()
                .where('id', applcation.teacher_id)
                .andWhere('school_id', ctx.auth.user!.school_id)
                .first();

            let leave_policy : LeavePolicies | null = null 

            // staf if and leave if to fetch leave policy
            if(paylaod.leave_type_id){
                leave_policy = await LeavePolicies.query()
                .where('staff_role_id' , teacher!.staff_role_id)
                .andWhere('leave_type_id' ,paylaod.leave_type_id).first()
            }else{
                leave_policy = await LeavePolicies.query()
                .where('staff_role_id' , teacher!.staff_role_id)
                .andWhere('leave_type_id' ,applcation.leave_type_id).first()
            }

            if (!leave_policy) {
                return ctx.response.status(404).json({
                    message: "This leave type or policy is been available for your school"
                });
            }
            try {
                numberOfDays = await this.validateLeaveRequestForUpdate(applcation.serialize(), paylaod, leave_policy);
            } catch (error) {
                return ctx.response.status(404).json({
                    message: error.message
                })
            }
            await applcation.merge({...paylaod , number_of_days : numberOfDays}).save();

            return ctx.response.status(201).json(applcation);

        } else if (staff_type === "non-teaching") {
            let applcation = await OtherStaffLeaveApplication.findBy('uuid', leave_application_id);

            if (!applcation) {
                return ctx.response.status(404).json({
                    message: "Leave application you are requesting is not available"
                })
            }

            let paylaod = await UpdateValidatorForOtherStaffLeaveApplication.validate(ctx.request.body());

            if (paylaod.leave_type_id) {
                let leave_type = await LeaveTypeMaster.query()
                    .where('id', paylaod.leave_type_id)
                    .andWhere('school_id', ctx.auth.user!.school_id)
                    .first();

                if (!leave_type) {
                    return ctx.response.status(404).json({
                        message: "This leave type is not available for your school"
                    })
                }
            }

            await applcation.merge(paylaod).save();

            return ctx.response.status(201).json(applcation);
        } else {
            return ctx.response.status(404).json({
                message: "You need to define role correctly ! "
            })
        }
    }


    /**
     *  Controller for handle application approval , status and Balance 
     *  
     */

    async addLeaveBalanceForStaff(ctx : HttpContext){

    }   

}

