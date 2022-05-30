exports.up = async function (sql) {
  try {
    await sql`
      DROP TYPE IF EXISTS "environment";
    `;

    await sql`
      CREATE TYPE "environment" AS ENUM (
        'TEST',
        'LIVE'
      );
    `;

    await sql`
      CREATE TABLE "requests" (
        "request_id" uuid PRIMARY KEY,
        "path" varchar(100) NOT NULL,
        "body" json NOT NULL,
        "time_creation" timestamp DEFAULT now () NOT NULL,
        "organization_id" uuid NOT NULL,
        "env" environment NOT NULL,
        "version" integer NOT NULL
      );
    `;
  } catch (error) {
    console.error(error);
  }
};

exports.down = async function (sql) {
  try {
    await sql`
      DROP TYPE "environment";
    `;

    await sql`
      DROP TABLE IF EXISTS "requests";
    `;
  } catch (error) {
    console.error(error);
  }
};
