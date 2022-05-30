exports.up = async function (sql) {
  try {
    await sql`
      ALTER TABLE "lineitems" 
        DROP CONSTRAINT "lineitems_business_cases_fk";
    `;

    await sql`
      ALTER TABLE "lineitems" 
        DROP COLUMN "business_case_id";
    `;

    await sql`
      ALTER TABLE "business_cases" 
        ALTER COLUMN "type" SET DATA TYPE business_case_type USING type::business_case_type;
    `;
  } catch (error) {
    console.error(error);
  }
};

exports.down = async function (sql) {
  try {
    await sql`
      ALTER TABLE "business_cases" 
        ALTER COLUMN "type" SET DATA TYPE varchar(30);
    `;

    await sql`
      ALTER TABLE "lineitems" 
        ADD COLUMN "business_case_id" uuid NOT NULL;
    `;

    await sql`
      ALTER TABLE "lineitems"
        ADD CONSTRAINT "lineitems_business_cases_fk" FOREIGN KEY ("business_case_id") REFERENCES "business_cases" ("business_case_id") ON DELETE CASCADE;
    `;
  } catch (error) {
    console.error(error);
  }
};
