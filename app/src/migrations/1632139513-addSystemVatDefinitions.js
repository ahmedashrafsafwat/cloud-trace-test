// eslint-disable-next-line
const uuid = require('uuid').v4;

exports.up = async (sql) => {
  // Add new field to be able to hold the historic vat definition
  await sql`
    ALTER TABLE amounts_per_vat_ids
        ADD vat_definition_export_id bigint;
  `;
  await sql`
    ALTER TABLE subitems
      ADD vat_definition_export_id bigint;
  `;

  await sql`
    UPDATE system_vat_definitions
    SET
        validity = '[1970-01-01 00:00:00, 2022-01-01 00:00:00)',
        historic_export_id = 13
    WHERE
        vat_definition_export_id = 3
        AND validity = '["1970-01-01 00:00:00","2099-12-31 00:00:00"]';
  `;
  await sql`
    UPDATE system_vat_definitions
    SET
        historic_export_id = 14
    WHERE
        vat_definition_export_id = 4
        AND validity = '["1970-01-01 00:00:00","2099-12-31 00:00:00"]';
  `;

  const newVatdefinition = {
    // vat_definition_id and env will be set at a later point
    vat_definition_export_id: 3,
    percentage: 9.5,
    description: 'Durchschnittsatz (§ 24 Abs. 1 Nr. 3 UStG) übrige Fälle',
    validity: '["2022-01-01 00:00:00", "2099-12-31 00:00:00"]',
    historic_export_id: 23,
    dsfinvk_version: '2.3',
  };
  const input = [
    {
      ...newVatdefinition,
      vat_definition_id: uuid(),
      env: 'LIVE',
    },
    {
      ...newVatdefinition,
      vat_definition_id: uuid(),
      env: 'TEST',
    },
  ];

  await sql`
    INSERT INTO system_vat_definitions
    ${sql(
      input,
      'vat_definition_id',
      'vat_definition_export_id',
      'percentage',
      'description',
      'env',
      'validity',
      'historic_export_id',
      'dsfinvk_version',
    )};
  `;
};

exports.down = async () => {
  return Promise.resolve();
};
