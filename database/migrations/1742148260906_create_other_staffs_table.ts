import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'other_staff'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {

      table.string('middle_name', 100).nullable().alter({alterNullable : true});

      table.string('first_name_in_guj', 100).nullable().alter({ alterNullable: true });
      table.string('middle_name_in_guj', 100).nullable().alter({ alterNullable: true });
      table.string('last_name_in_guj', 100).nullable().alter({ alterNullable: true });
    
      table.date('birth_date').nullable().alter({ alterNullable: true }) // Ensure age validation

      table.date('joining_date').nullable().alter({ alterNullable: true })

      table.string('religiion', 50).nullable().alter({ alterNullable: true });
      table.string('religiion_in_guj', 50).nullable().alter({ alterNullable: true });

      table.string('caste', 100).nullable().alter({ alterNullable: true });
      table.string('caste_in_guj', 100).nullable().alter({ alterNullable: true });
      table.enum('category', ['ST', 'SC', 'OBC', 'OPEN']).nullable().alter({ alterNullable: true });

      table.string('address', 100).nullable().alter({ alterNullable: true });
      table.string('district', 100).nullable().alter({ alterNullable: true });
      table.string('city', 100).nullable().alter({ alterNullable: true });
      table.string('state', 100).nullable().alter({ alterNullable: true });
      table.bigInteger('postal_code').unsigned().nullable().alter({ alterNullable: true });

      table.string('bank_name', 100).nullable().alter({ alterNullable: true });

      table.dropUnique(['account_no']); // Step 1: Drop UNIQUE constraint
      table.bigInteger('account_no').unsigned().nullable().alter() // Step 2: Make nullable
      table.unique('account_no') // Step 3: Re-add UNIQUE constraint

      table.string('IFSC_code', 15).nullable().alter({ alterNullable: true });
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}