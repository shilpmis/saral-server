import type { HttpContext } from '@adonisjs/core/http'
import Classes from '#models/Classes'
import { CreateManyValidatorForClasses, CreateValidatorForClasses, UpdateValidatorForClasses } from '#validators/Classes'


type TypeForIndexSchoolClasses = { class: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12, divisions: Classes[] }

export default class ClassesController {

  async indexClassesForSchool(ctx: HttpContext) {
    // let school_id = ctx.auth.user?.school_id;
    if (ctx.params.school_id) {
      let classes = await Classes.query().where('school_id', ctx.params.school_id);

      /**
       * Edjust output object according to `
       */
      if (classes.length > 0) {

        let output_obj: TypeForIndexSchoolClasses[] = [
          {
            class: 1,
            divisions: []
          },
          {
            class: 2,
            divisions: []
          },
          {
            class: 3,
            divisions: []
          },
          {
            class: 4,
            divisions: []
          },
          {
            class: 5,
            divisions: []
          },
          {
            class: 6,
            divisions: []
          },
          {
            class: 7,
            divisions: []
          },
          {
            class: 8,
            divisions: []
          },
          {
            class: 9,
            divisions: []
          },
          {
            class: 10,
            divisions: []
          },
          {
            class: 11,
            divisions: []
          },
          {
            class: 12,
            divisions: []
          },
        ];

        output_obj = output_obj.map((std: TypeForIndexSchoolClasses) => {
          // console.log("Check Classes" , [...classes])
          let divisions = [...classes].filter((item) => {
            return item.class == std.class
          })
          divisions.sort((a, b) => a.division.localeCompare(b.division))
          return { ...std, divisions: divisions }
        })
        return ctx.response.json(output_obj);
      }

      return ctx.response.json(classes);
    } else {
      return ctx.response.status(404).json({ message: 'Please provide valid Class ID.' });
    }
  }


  async indexStandard(ctx: HttpContext) {
    if (ctx.params.school_id) {
      let classes = await Classes.query().where('school_id', ctx.params.school_id).andWhere('class', ctx.params.class);
      return ctx.response.json(classes);
    } else {
      return ctx.response.status(404).json({ message: 'Please provide valid Class ID.' });
    }
  }


  /**
   * 
   * @param ctx 
   * @returns 
   * 
   * this method will only create default class , which will create divition 'A' only
   */
  async createClass(ctx: HttpContext) {

    /**
     * TODO : Check for unique alise names of class , for perticular school 
     */
    let school_id = ctx.auth.user?.school_id
    if (ctx.auth.user?.role_id !== 1) {
      return ctx.response.status(403).json({ message: 'You are not allocated to manage this functions.' });
    }
    const payload = await CreateValidatorForClasses.validate(ctx.request.body());
    const created_class = await Classes.create({ ...payload, school_id: school_id, division: "A" });
    return ctx.response.json(created_class.serialize());
  }


  /**
   * 
   * @param ctx 
   * @returns 
   * 
   * this method will only create default class , which will create divition 'A' only
   */
  async createMultipleClasses(ctx: HttpContext) {

    /**
     * TODO : Check for unique alise names of class , for perticular school 
     */
    let school_id = ctx.auth.user?.school_id

    if (ctx.auth.user?.role_id !== 1) {
      return ctx.response.status(403).json({ message: 'You are not allocated to manage this functions.' });
    }
    let payload = await CreateManyValidatorForClasses.validate(ctx.request.body());
    payload = payload.map((item) => {
      return { ...item, school_id: school_id, division: "A" }
    })
    const created_class = await Classes.createMany(payload);
    return ctx.response.json(created_class);
  }

  async updateClass(ctx: HttpContext) {

    let school_id = ctx.auth.user!.school_id
    if (ctx.auth.user?.role_id !== 1) {
      return ctx.response.status(403).json({ message: 'You are not allocated to manage this functions.' });
    }
    const payload = await UpdateValidatorForClasses.validate(ctx.request.body());
    // const class_id = ctx.params.id;
    const updated_class = await Classes.query().where('id', ctx.params.class_id).andWhere('school_id', school_id).first();
    if (updated_class) {
      updated_class.merge(payload);
      await updated_class.save();
      return ctx.response.json(updated_class.serialize());
    } else {
      return ctx.response.status(404).json({ message: 'Please provide a valid class , this class is not available for your school ! ' });
    }
  }

  /**
   * 
   * @param ctx 
   * @returns 
   * 
   * method will create Division for class
   * 
   * TODO :: Add automation code for create a plus one division only . 
   *     ex : if there is division A and B are there , the next one should be C not D or any other .
   */
  async createDivision(ctx: HttpContext) {

    let school_id = ctx.auth.user?.school_id
    if (ctx.auth.user?.role_id !== 1) {
      return ctx.response.status(403).json({ message: 'You are not allocated to manage this functions.' });
    }
    const payload = await CreateValidatorForClasses.validate(ctx.request.body());

    /**
     * Check it there a default class for this std , (ex for class 3-C , there should be a )
     */
    const created_class = await Classes.create({ ...payload, school_id: school_id });
    return ctx.response.json(created_class.serialize());
  }
}



