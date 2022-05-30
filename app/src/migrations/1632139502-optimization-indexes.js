exports.up = async (sql) => {
  await sql`
    CREATE INDEX exports_export_id_organization_id_index
      ON exports USING btree
        (export_id ASC NULLS LAST, organization_id ASC NULLS LAST);
  `;

  await sql`
    CREATE INDEX cash_registers_client_id_organization_id_index
      ON cash_registers USING btree
        (client_id ASC NULLS LAST, organization_id ASC NULLS LAST);
  `;

  await sql`
    CREATE INDEX cash_point_closings_sign_api_version_closing_id_index
      ON cash_point_closings USING btree
        (sign_api_version DESC NULLS LAST, cash_point_closing_id ASC);
  `;

  await sql`
    CREATE INDEX cash_point_closings_time_creation_index
      ON cash_point_closings USING btree
        (time_creation ASC NULLS LAST);
  `;
};

exports.down = async () => {
  return Promise.resolve();
};
