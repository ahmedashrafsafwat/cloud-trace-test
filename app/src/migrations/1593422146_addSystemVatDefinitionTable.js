// eslint-disable-next-line
const uuidv4 = require('uuid').v4;

exports.up = async function (sql) {
  const input = [
    {
      vat_definition_id: uuidv4(),
      vat_definition_export_id: 1,
      percentage: 19,
      description: 'Regelsteuersatz',
      env: 'TEST',
      validity: '[1970-01-01, 2020-07-01)',
      historic_export_id: 11,
      dsfinvk_version: '2.1',
    },
    {
      vat_definition_id: uuidv4(),
      vat_definition_export_id: 2,
      percentage: 7,
      description: 'Ermäßigter Steuersatz',
      env: 'TEST',
      validity: '[1970-01-01, 2020-07-01)',
      historic_export_id: 12,
      dsfinvk_version: '2.1',
    },
    {
      vat_definition_id: uuidv4(),
      vat_definition_export_id: 3,
      percentage: 10.7,
      description: 'Durchschnittsatz (§ 24 Abs. 1 Nr. 3 UStG) übrige Fälle',
      env: 'TEST',
      validity: '[1970-01-01, 2099-12-31]',
      historic_export_id: null,
      dsfinvk_version: '2.1',
    },
    {
      vat_definition_id: uuidv4(),
      vat_definition_export_id: 4,
      percentage: 5.5,
      description: 'RegelsteuersatzDurchschnittsatz (§ 24 Abs.1 Nr.1 UStG)',
      env: 'TEST',
      validity: '[1970-01-01, 2099-12-31]',
      historic_export_id: null,
      dsfinvk_version: '2.1',
    },
    {
      vat_definition_id: uuidv4(),
      vat_definition_export_id: 5,
      percentage: 0,
      description: 'Nicht Steuerbar',
      env: 'TEST',
      validity: '[1970-01-01, 2099-12-31]',
      historic_export_id: null,
      dsfinvk_version: '2.1',
    },
    {
      vat_definition_id: uuidv4(),
      vat_definition_export_id: 6,
      percentage: 0,
      description: 'Umsatzsteuerfrei',
      env: 'TEST',
      validity: '[1970-01-01, 2099-12-31]',
      historic_export_id: null,
      dsfinvk_version: '2.1',
    },
    {
      vat_definition_id: uuidv4(),
      vat_definition_export_id: 7,
      percentage: 0,
      description: 'UmsatzsteuerNichtErmittelbar',
      env: 'TEST',
      validity: '[1970-01-01, 2099-12-31]',
      historic_export_id: null,
      dsfinvk_version: '2.1',
    },
    {
      vat_definition_id: uuidv4(),
      vat_definition_export_id: 1,
      percentage: 19,
      description: 'Regelsteuersatz',
      env: 'LIVE',
      validity: '[1970-01-01, 2020-07-01)',
      historic_export_id: 11,
      dsfinvk_version: '2.1',
    },
    {
      vat_definition_id: uuidv4(),
      vat_definition_export_id: 2,
      percentage: 7,
      description: 'Ermäßigter Steuersatz',
      env: 'LIVE',
      validity: '[1970-01-01, 2020-07-01)',
      historic_export_id: 12,
      dsfinvk_version: '2.1',
    },
    {
      vat_definition_id: uuidv4(),
      vat_definition_export_id: 3,
      percentage: 10.7,
      description: 'Durchschnittsatz (§ 24 Abs. 1 Nr. 3 UStG) übrige Fälle',
      env: 'LIVE',
      validity: '[1970-01-01, 2099-12-31]',
      historic_export_id: null,
      dsfinvk_version: '2.1',
    },
    {
      vat_definition_id: uuidv4(),
      vat_definition_export_id: 4,
      percentage: 5.5,
      description: 'RegelsteuersatzDurchschnittsatz (§ 24 Abs.1 Nr.1 UStG)',
      env: 'LIVE',
      validity: '[1970-01-01, 2099-12-31]',
      historic_export_id: null,
      dsfinvk_version: '2.1',
    },
    {
      vat_definition_id: uuidv4(),
      vat_definition_export_id: 5,
      percentage: 0,
      description: 'Nicht Steuerbar',
      env: 'LIVE',
      validity: '[1970-01-01, 2099-12-31]',
      historic_export_id: null,
      dsfinvk_version: '2.1',
    },
    {
      vat_definition_id: uuidv4(),
      vat_definition_export_id: 6,
      percentage: 0,
      description: 'Umsatzsteuerfrei',
      env: 'LIVE',
      validity: '[1970-01-01, 2099-12-31]',
      historic_export_id: null,
      dsfinvk_version: '2.1',
    },
    {
      vat_definition_id: uuidv4(),
      vat_definition_export_id: 7,
      percentage: 0,
      description: 'UmsatzsteuerNichtErmittelbar',
      env: 'LIVE',
      validity: '[1970-01-01, 2099-12-31]',
      historic_export_id: null,
      dsfinvk_version: '2.1',
    },
    {
      vat_definition_id: uuidv4(),
      vat_definition_export_id: 1,
      percentage: 16,
      description: 'Regelsteuersatz',
      env: 'TEST',
      validity: '[2020-07-01, 2021-01-01)',
      historic_export_id: 21,
      dsfinvk_version: '2.2',
    },
    {
      vat_definition_id: uuidv4(),
      vat_definition_export_id: 2,
      percentage: 5,
      description: 'Ermäßigter Steuersatz',
      env: 'TEST',
      validity: '[2020-07-01, 2021-01-01)',
      historic_export_id: 22,
      dsfinvk_version: '2.2',
    },
    {
      vat_definition_id: uuidv4(),
      vat_definition_export_id: 1,
      percentage: 16,
      description: 'Regelsteuersatz',
      env: 'LIVE',
      validity: '[2020-07-01, 2021-01-01)',
      historic_export_id: 21,
      dsfinvk_version: '2.2',
    },
    {
      vat_definition_id: uuidv4(),
      vat_definition_export_id: 2,
      percentage: 5,
      description: 'Ermäßigter Steuersatz',
      env: 'LIVE',
      validity: '[2020-07-01, 2021-01-01)',
      historic_export_id: 22,
      dsfinvk_version: '2.2',
    },
    {
      vat_definition_id: uuidv4(),
      vat_definition_export_id: 1,
      percentage: 19,
      description: 'Regelsteuersatz',
      env: 'TEST',
      validity: '[2021-01-01, 2099-12-31]',
      historic_export_id: null,
      dsfinvk_version: '2.2',
    },
    {
      vat_definition_id: uuidv4(),
      vat_definition_export_id: 2,
      percentage: 7,
      description: 'Ermäßigter Steuersatz',
      env: 'TEST',
      validity: '[2021-01-01, 2099-12-31]',
      historic_export_id: null,
      dsfinvk_version: '2.2',
    },
    {
      vat_definition_id: uuidv4(),
      vat_definition_export_id: 1,
      percentage: 19,
      description: 'Regelsteuersatz',
      env: 'LIVE',
      validity: '[2021-01-01, 2099-12-31]',
      historic_export_id: null,
      dsfinvk_version: '2.2',
    },
    {
      vat_definition_id: uuidv4(),
      vat_definition_export_id: 2,
      percentage: 7,
      description: 'Ermäßigter Steuersatz',
      env: 'LIVE',
      validity: '[2021-01-01, 2099-12-31]',
      historic_export_id: null,
      dsfinvk_version: '2.2',
    },
  ];

  try {
    await sql`
      CREATE EXTENSION btree_gist;
    `;

    await sql`
      CREATE TABLE system_vat_definitions
      (
        vat_definition_id uuid NOT NULL,
        vat_definition_export_id smallint NOT NULL,
        percentage numeric(5,2) NOT NULL,
        description character varying(55),
        env character (4) NOT NULL,
        time_creation timestamp without time zone NOT NULL DEFAULT now(),
        time_update timestamp without time zone NOT NULL DEFAULT now(),
        validity tsrange NOT NULL,
        dsfinvk_version character varying(12) NOT NULL,
        historic_export_id smallint,
        CONSTRAINT system_vat_definitions_pkey PRIMARY KEY (vat_definition_id),
        EXCLUDE USING gist (env WITH =, vat_definition_export_id WITH =, validity WITH &&)
      );
    `;
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
  } catch (error) {
    console.error(error);
  }
};

exports.down = async function (sql) {
  try {
    await sql`
      DROP TABLE system_vat_definitions;
    `;
  } catch (error) {
    console.error(error);
  }
};
