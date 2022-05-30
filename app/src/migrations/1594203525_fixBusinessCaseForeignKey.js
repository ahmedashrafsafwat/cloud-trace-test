exports.up = async function (sql) {
  try {
    await sql`
      ALTER TABLE "amounts_per_vat_ids" 
        DROP CONSTRAINT "amounts_per_vat_ids_business_cases_fk";
    `;

    await sql`
      ALTER TABLE "amounts_per_vat_ids" 
        ADD CONSTRAINT "amounts_per_vat_ids_business_cases_fk" FOREIGN KEY ("business_case_id") REFERENCES "business_cases" ("business_case_id") ON DELETE CASCADE;
    `;
  } catch (error) {
    console.error(error);
  }
};

exports.down = async function (sql) {
  try {
    await sql`
      ALTER TABLE "amounts_per_vat_ids" 
        DROP CONSTRAINT "amounts_per_vat_ids_business_cases_fk";
    `;

    await sql`
      ALTER TABLE "amounts_per_vat_ids"
	      ADD CONSTRAINT "amounts_per_vat_ids_business_cases_fk" FOREIGN KEY ("business_case_id") REFERENCES "business_cases" ("business_case_id");
    `;
  } catch (error) {
    console.error(error);
  }
};
