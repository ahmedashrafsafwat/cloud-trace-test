exports.up = async function (sql) {
  try {
    await sql`
      CREATE TYPE "export_state" 
      AS ENUM ('PENDING', 'WORKING', 'COMPLETED', 'CANCELLED', 'EXPIRED', 'DELETED', 'ERROR');
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS "exports" (
        "export_id" uuid PRIMARY KEY,
        "export_state" export_state NOT NULL,
        "input_query" json NOT NULL,
        "input_query_result_hash" varchar(128) NOT NULL,
        "error_message" varchar(200),
        "error_details" json,
        "time_request" timestamp NOT NULL,
        "time_start" timestamp,
        "time_end" timestamp,
        "time_expiration" timestamp,
        "time_error" timestamp,
        "href" varchar(200),
        "download_checksum" varchar(200),
        "metadata" json,
        "env" environment NOT NULL,
        "version" integer NOT NULL
      );
  `;

    await sql`
      CREATE TABLE IF NOT EXISTS "export_cash_point_closings" (
        export_id uuid REFERENCES "exports" ("export_id") ON DELETE CASCADE,
        cash_point_closing_id uuid REFERENCES "cash_point_closings" ("cash_point_closing_id") ON DELETE CASCADE,
        PRIMARY KEY (export_id, cash_point_closing_id)
      );  
    `;
  } catch (error) {
    console.error(error);
  }
};

exports.down = async function (sql) {
  try {
    await sql`
      DROP TABLE IF EXISTS "export_cash_point_closings";
  `;

    await sql`
      DROP TABLE IF EXISTS "exports";
    `;

    await sql`
      DROP TYPE IF EXISTS "export_state";
    `;
  } catch (error) {
    console.error(error);
  }
};
