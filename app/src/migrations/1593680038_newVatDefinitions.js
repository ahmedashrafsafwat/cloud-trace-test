exports.up = async function (sql) {
  try {
    await sql`
      TRUNCATE "cash_point_closings" CASCADE;
    `;

    await sql`
      TRUNCATE "vat_definitions" CASCADE;
    `;

    await sql`
      ALTER TABLE "amounts_per_vat_ids" DROP CONSTRAINT "amounts_per_vat_ids_vat_definitions_fk";
    `;

    await sql`
      ALTER TABLE "amounts_per_vat_ids" DROP COLUMN "vat_definition_revision";
    `;

    await sql`
      ALTER TABLE "subitems" DROP CONSTRAINT "subitems_vat_definitions_fk";
    `;

    await sql`
      ALTER TABLE "subitems" DROP COLUMN "vat_definition_revision";
    `;

    await sql`
      ALTER TABLE "vat_definitions" DROP CONSTRAINT "vat_definitions_pkey";
    `;

    await sql`
      ALTER TABLE "vat_definitions" ADD PRIMARY KEY ("vat_definition_id");
    `;

    await sql`
      ALTER TABLE "vat_definitions"
	      ADD CONSTRAINT "check_vat_definition_export_id" CHECK (vat_definition_export_id > 999)
    `;

    await sql`
      ALTER TABLE "subitems"
	      ADD CONSTRAINT "subitems_vat_definitions_fk" FOREIGN KEY ("vat_definition_id") REFERENCES "vat_definitions" ("vat_definition_id") ON DELETE RESTRICT;
    `;

    await sql`
      ALTER TABLE "amounts_per_vat_ids"
	      ADD CONSTRAINT "amounts_per_vat_ids_vat_definitions_fk" FOREIGN KEY ("vat_definition_id") REFERENCES "vat_definitions" ("vat_definition_id") ON DELETE RESTRICT;
    `;

    await sql`
      ALTER TABLE "amounts_per_vat_ids" ALTER COLUMN "vat_definition_id" DROP NOT NULL;
    `;

    await sql`
      ALTER TABLE "subitems" ALTER COLUMN "vat_definition_id" DROP NOT NULL;
    `;

    await sql`
      ALTER TABLE "amounts_per_vat_ids" ADD COLUMN "system_vat_definition_id" uuid;
    `;

    await sql`
      ALTER TABLE "subitems" ADD COLUMN "system_vat_definition_id" uuid;
    `;

    await sql`
      ALTER TABLE "subitems"
        ADD CONSTRAINT "subitems_check_vat_definition_fk" CHECK ((vat_definition_id IS NOT NULL AND system_vat_definition_id IS NULL) OR(vat_definition_id IS NULL AND system_vat_definition_id IS NOT NULL));
    `;

    await sql`
      ALTER TABLE "amounts_per_vat_ids"
        ADD CONSTRAINT "amounts_per_vat_ids_check_vat_definition_fk" CHECK ((vat_definition_id IS NOT NULL AND system_vat_definition_id IS NULL) OR(vat_definition_id IS NULL AND system_vat_definition_id IS NOT NULL));
    `;

    await sql`
      ALTER TABLE "amounts_per_vat_ids" 
        ADD FOREIGN KEY ("system_vat_definition_id") REFERENCES "system_vat_definitions" ("vat_definition_id") ON DELETE RESTRICT;
    `;

    await sql`
      ALTER TABLE "subitems" 
        ADD FOREIGN KEY ("system_vat_definition_id") REFERENCES "system_vat_definitions" ("vat_definition_id") ON DELETE RESTRICT;
    `;
  } catch (error) {
    console.error(error);
  }
};

exports.down = async function (_sql) {
  try {
    // Nothing to do here
  } catch (error) {
    console.error(error);
  }
};
