exports.up = async function (sql) {
  try {
    await sql`
      ALTER TABLE cash_point_closings 
      ADD COLUMN state export_state NOT NULL default 'COMPLETED',
      ADD COLUMN error_message character varying(200),
      ADD COLUMN error_details json,
      ADD COLUMN time_start timestamp without time zone,
      ADD COLUMN time_end timestamp without time zone,
      ADD COLUMN time_expiration timestamp without time zone,
      ADD COLUMN time_error timestamp without time zone
    `;
    await sql`
      ALTER TABLE cash_point_closings 
      ALTER COLUMN state DROP DEFAULT
  `;
  } catch (error) {
    console.error(error);
  }
};

exports.down = async function (sql) {
  try {
    await sql`
      ALTER TABLE cash_point_closings 
      DROP COLUMN state,
      DROP COLUMN error_message,
      DROP COLUMN error_details,
      DROP COLUMN time_start,
      DROP COLUMN time_end,
      DROP COLUMN time_expiration,
      DROP COLUMN time_error
    `;
  } catch (error) {
    console.error(error);
  }
};
