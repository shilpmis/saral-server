import type { HttpContext } from '@adonisjs/core/http'
import Staff from '#models/Staff'
import { CreateValidatorForStaff, UpdateValidatorForStaff } from '#validators/Staff'
import StaffMaster from '#models/StaffMaster';


export default class StaffController {

  async index(ctx: HttpContext) {
    const staff = await Staff.query().paginate(ctx.request.input('page', 1), 10);
    return ctx.response.json(staff.serialize());
  }


  async createStaff(ctx: HttpContext) {

    // Check whether this role is associalted with this school
    const payload = await CreateValidatorForStaff.validate(ctx.request.body());

    const role = await StaffMaster.findBy('id', payload.staff_role_id);
    
    if(!role){
      return ctx.response.status(404).json({
        message : "This role is not available for your school ! Please add valid role ."
      })
    }
    
    if(role.school_id !=  ctx.auth.user?.school_id){
      return ctx.response.status(401).json({
        message : "You are not authorized to perform this action !"
      })
    }

    let staff = await Staff.create(payload);
    return ctx.response.json(staff.serialize());

  }


  async updateStaff(ctx: HttpContext) {
    const payload = await UpdateValidatorForStaff.validate(ctx.request.body());
    const staff = await Staff.findOrFail(ctx.request.input('id'));
    await staff.merge(payload).save();
    return ctx.response.json(staff.serialize());
  }

  // async create(ctx: HttpContext) {
  //   const payload = await CreateValidatorForStaff.validate(ctx.request.all());
  //   const staff = await Staff.create(payload);
  //   return ctx.response.json(staff.serialize());
  // }

  // async store(ctx: HttpContext) { }

  // async show(ctx: HttpContext) {
  //   const staff = await Staff.findOrFail(ctx.request.input('id'));
  //   return ctx.response.json(staff.serialize());
  // }

  // async update(ctx: HttpContext) {
  //   const payload = await UpdateValidatorForStaff.validate(ctx.request.all());
  //   const staff = await Staff.findOrFail(ctx.request.input('id'));
  //   await staff.merge(payload).save();
  //   return ctx.response.json(staff.serialize());
  // }

  // async filterStaff(ctx: HttpContext) {
  //   const staff = await Staff.query().where('role', 'student').paginate(ctx.request.input('page', 1), 10);
  //   return ctx.response.json(staff.serialize());
  // }

  // public async bulkUploadStudents(ctx: HttpContext) {
  //   const school_id = ctx.auth.user!.school_id;
  //   const role_id = ctx.auth.user!.role_id;
  //   const class_id = ctx.request.input('class_id');
  //   // Check if the user is authorized to perform this action

  //   if (role_id !== 1) {
  //       return ctx.response.status(403).json({ message: "You are not authorized to perform this action." });
  //   }

  //   if (!class_id) {
  //       return ctx.response.status(400).json({ message: "Class ID is required." });
  //   }

  //   const classRecord = await Classes.query()
  //       .where('id', class_id)
  //       .andWhere('school_id', school_id)
  //       .first();

  //   if (!classRecord) {
  //       return ctx.response.status(400).json({ message: "Class not found." });
  //   }

  //   try {
  //       // Ensure a file is uploaded
  //       const file = ctx.request.file('file', {
  //           extnames: ["csv",
  //               "xlsx",
  //               "xls",
  //           ],
  //           size: '20mb',

  //       });
  //       if (!file) {
  //           return ctx.response.status(400).json({ message: 'No file uploaded.' });
  //       }
  //       // Move file to temp storage
  //       const uploadDir = path.join(app.tmpPath(), 'uploads');
  //       await file.move(uploadDir);

  //       if (!file.isValid) {
  //           return ctx.response.badRequest({ message: file.errors });
  //       }

  //       // Construct file path
  //       const filePath = path.join(uploadDir, file.clientName);

  //       // Parse CSV file into JSON
  //       const jsonData = await parseAndReturnJSON(filePath);

  //       if (!jsonData.length) {
  //           return ctx.response.badRequest({ message: 'CSV file is empty or improperly formatted.' });
  //       }

  //       // Start a database transaction
  //       const trx = await db.transaction();

  //       try {
  //           let validatedData = [];
  //           let errors = [];
  //           for (const [index, data] of jsonData.entries()) {

  //               // Transform the flat data into nested structure
  //               let transformedData = {
  //                   students_data: {
  //                       first_name: data.first_name,
  //                       middle_name: data.middle_name,
  //                       last_name: data.last_name,
  //                       gender: data.gender,
  //                       gr_no: data.gr_no,
  //                       primary_mobile: data.phone,
  //                       aadhar_no: data.aadhar_no,
  //                       father_name: data.father_name,
  //                       is_active: true,
  //                   },
  //               };


  //               try {
  //                   const validatedStudent = await CreateValidatorForUpload.validate(transformedData);


  //                   const student_data = await Students.create({
  //                       ...validatedStudent.students_data,
  //                       school_id,
  //                       class_id: class_id
  //                   }, { client: trx });

  //                   // Insert student meta data
  //                   const student_meta_data_payload = await StudentMeta.create({
  //                       ...validatedStudent.student_meta_data,
  //                       student_id: student_data.id,
  //                   }, { client: trx });

  //                   validatedData.push({ student_data, student_meta_data_payload });
  //               } catch (validationError) {
  //                   errors.push({
  //                       row: index + 1,
  //                       message: 'Validation failed',
  //                       errors: validationError.messages,
  //                   });
  //               }
  //           }

  //           // If there were errors, rollback transaction and return them
  //           if (errors.length) {
  //               await trx.rollback();
  //               return ctx.response.status(400).json({
  //                   message: 'Some records failed validation',
  //                   errors,
  //               });
  //           }

  //           // Commit transaction if everything is fine
  //           await trx.commit();


  //           return ctx.response.status(201).json({
  //               message: 'Bulk upload successful',
  //               totalInserted: validatedData.length,
  //               // data: validatedData,
  //           });
  //       } catch (validationError) {
  //           await trx.rollback();
  //           return ctx.response.status(400).json({
  //               message: 'Validation failed',
  //               errors: validationError.messages,
  //           });
  //       }
  //   } catch (error) {
  //       return ctx.response.internalServerError({
  //           message: 'An error occurred while processing the bulk upload.',
  //           error: error.message,
  //       });
  //   }
  // }
}



