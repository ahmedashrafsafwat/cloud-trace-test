import test from 'ava';
import vatDefinitionSelectionData from '../fixtures/vatDefinitionsSelection.json';
import VatDefinitionPicker, {
  VatDefinitionSelection,
  VatDefinitionType,
} from './vatDefinitionPicker';

const list = new VatDefinitionPicker(
  vatDefinitionSelectionData as unknown as VatDefinitionSelection[],
);

test('Loading invalid data set', (t) => {
  t.throws(() => new VatDefinitionPicker({} as any));
});

test('Loading duplicates into class', (t) => {
  const listWithDuplicates = new VatDefinitionPicker([
    {
      vat_definition_id: 'a0257611-5657-492c-947f-87b04e01d08c',
      vat_definition_export_id: '2000',
      percentage: '20.00',
      description: 'Custom vat definition',
      env: 'TEST',
      version: 14000,
    },
    {
      vat_definition_id: 'a0257611-5657-492c-947f-87b04e01d08c',
      vat_definition_export_id: '2001',
      percentage: '21.00',
      description: 'Custom vat definition',
      env: 'TEST',
      version: 14000,
    },
  ]);
  const definition = listWithDuplicates.getVatDefinitionById(
    'a0257611-5657-492c-947f-87b04e01d08c',
  );
  t.is(definition.percentage, '21.00');
});

test('Throws if env is missing', (t) => {
  t.throws(
    () =>
      new VatDefinitionPicker([
        {
          vat_definition_id: 'ab257611-5657-492c-947f-87b04e01d08c',
          vat_definition_export_id: '2000',
          percentage: '20.00',
          description: 'Custom vat definition',
          version: 14000,
        } as any,
      ]),
  );
});

test('List can only contain vat definitions of the same env', (t) => {
  t.throws(
    () =>
      new VatDefinitionPicker([
        {
          vat_definition_id: 'ab257611-5657-492c-947f-87b04e01d08c',
          vat_definition_export_id: '2000',
          percentage: '20.00',
          description: 'Custom vat definition',
          env: 'LIVE',
          version: 14000,
        },
        {
          vat_definition_id: 'ac257611-5657-492c-947f-87b04e01d08c',
          vat_definition_export_id: '2001',
          percentage: '21.00',
          description: 'Custom vat definition',
          env: 'TEST',
          version: 14000,
        },
      ]),
  );
});

test('Retrieve definition via vatDefinitionId', (t) => {
  // Retrieve first vat definition in data set
  {
    const definition = list.getVatDefinitionById(
      'e8721881-e0be-477a-a764-416e6b1f4541',
    );
    t.is(definition.revision, 0);
    t.is(definition.vat_definition_export_id, 1);
  }

  // Retrieve a custom vat definition
  {
    const definition = list.getVatDefinitionById(
      'a0257611-5657-492c-947f-87b04e01d08c',
    );
    t.is(definition.revision, 1);
    t.is(definition.vat_definition_export_id, 2001);
  }
});

test('Retrieve unknown definition', (t) => {
  const definition = list.getVatDefinitionById(
    '00000000-0000-0000-0000-000000000000',
  );
  t.falsy(definition);
});

test('Retrieve definition via vatDefinitionExportId and revision', (t) => {
  // Check vat_definition_export_id 2001 r0
  {
    const definition = list.getVatDefinitionByExportId(2001, 0);
    t.is(definition.revision, 0);
    t.is(definition.vat_definition_export_id, 2001);
    t.is(definition.percentage, '20.00');
    t.is(definition.type, VatDefinitionType.CUSTOM);
  }

  // Check vat_definition_export_id 2001 r1
  {
    const definition = list.getVatDefinitionByExportId(2001, 1);
    t.is(definition.revision, 1);
    t.is(definition.vat_definition_export_id, 2001);
    t.is(definition.percentage, '21.00');
  }

  // Check vat_definition_export_id 2001 r2
  {
    const definition = list.getVatDefinitionByExportId(2001, 2);
    t.falsy(definition);
  }
});

test('Retrieve undefined vat_definition_id', (t) => {
  const definition = list.getVatDefinitionIdByExportIdAndValidity(
    10,
    new Date('1970-01-02 00:00:00'),
  );
  t.falsy(definition);
});

test('Retrieve vat_definition_id depending on validity', (t) => {
  const definition = list.getVatDefinitionIdByExportIdAndValidity(
    2,
    new Date('1970-01-02 00:00:00'),
  );
  t.is(definition.vat_definition_id, '016545c5-df0e-473a-99c7-716724810d92');
});

test('Try retrieving vat_definition_id with out of range validity', (t) => {
  const definition = list.getVatDefinitionIdByExportIdAndValidity(
    2,
    new Date('2999-01-01 00:00:00'),
  );
  t.falsy(definition);
});

test('Throw error for missing validity', (t) => {
  const missingValidity = new VatDefinitionPicker([
    {
      vat_definition_id: 'ab257611-5657-492c-947f-87b04e01d08c',
      vat_definition_export_id: '1',
      percentage: '20.00',
      description: 'Custom vat definition',
      env: 'TEST',
      version: 14000,
    },
  ]);
  t.throws(() =>
    missingValidity.getVatDefinitionIdByExportIdAndValidity(1, new Date()),
  );
});

test('Retrieve historic vat definition', (t) => {
  const definition = list.getLatestVatDefinitionByExportId(21);
  t.is(definition.vat_definition_export_id, 1);
  t.is(definition.revision, 0);
  t.is(definition.historic_export_id, 21);
});

test('Retrieve latest revision of vatDefinitionExportId', (t) => {
  const definition = list.getLatestVatDefinitionByExportId('2001');
  t.is(definition.revision, 11);
});

test('Retrieve unknown vatDefinitionExportId with revision', (t) => {
  const definition = list.getVatDefinitionByExportId(5000, 0);
  t.falsy(definition);
});

test('Retrieve latest revision of unknown vatDefinitionExportId', (t) => {
  const definition = list.getLatestVatDefinitionByExportId(5000);
  t.falsy(definition);
});

test('Retrieve latest revision of system vat definition', (t) => {
  const definition = list.getLatestVatDefinitionByExportId(2);
  t.is(definition.vat_definition_id, '9c812f24-41d0-4b53-aa9b-b0496ab15766');
  t.is(definition.vat_definition_export_id, 2);
  t.is(definition.revision, 0);
});

test('Retrieve related vat definition', (t) => {
  const definition = list.getRelatedVatDefinitionById(
    'e8721881-e0be-477a-a764-416e6b1f4541',
    new Date('2020-07-01 00:00:01'),
  );
  t.truthy(definition);
  t.is(definition.percentage, '16.00');
});

test('Try retrieving related vat definition with out of bound timestamp', (t) => {
  const definition = list.getRelatedVatDefinitionById(
    'e8721881-e0be-477a-a764-416e6b1f4541',
    new Date('2999-07-01 00:00:00'),
  );
  t.falsy(definition);
});

test('Retrieve historic export id via vat_definition_id', (t) => {
  const vatExportId = list.getExportIdFromHistoricOrRelatedVatDefinitionById(
    'e8721881-e0be-477a-a764-416e6b1f4541',
    new Date('2020-07-01 00:00:01'),
  );
  // The date is outside of the validity range of the given vat definition.
  // Since the vat definition has a historic export id set, we expect the
  // returned value to be the same as such.
  t.is(vatExportId, 11);
});

test('Retrieve export id via vat_definition_id', (t) => {
  const vatExportId = list.getExportIdFromHistoricOrRelatedVatDefinitionById(
    'e8721881-e0be-477a-a764-416e6b1f4541',
    new Date('2020-06-01 00:00:01'),
  );
  // As the date is within the validity range of the given vat definition,
  // we expect the returned value to be the same as the
  // vat definition export id.
  t.is(vatExportId, 1);
});

test('Retrieve export id via vat_definition_id before validity range', (t) => {
  const pointInTime = new Date('2020-12-31 00:00:01');
  const vatExportId = list.getExportIdFromHistoricOrRelatedVatDefinitionById(
    'ad1c8bd7-a2ae-42c7-a380-7ef10c1e4d07',
    pointInTime,
  );
  // The timestamp is outside the validity range of the vat definition.
  // However, it falls into a validity range of another definition which is
  // being used instead.
  t.is(vatExportId, 1);
  const definition = list.getVatDefinitionIdByExportIdAndValidity(
    vatExportId,
    pointInTime,
  );
  t.is(definition.percentage, '16.00');
});

test('Retrieve export id via vat_definition_id outside of validity range', (t) => {
  const vatExportId = list.getExportIdFromHistoricOrRelatedVatDefinitionById(
    'ad1c8bd7-a2ae-42c7-a380-7ef10c1e4d07',
    new Date('2099-12-31 00:00:01'),
  );
  // As the timestamp is outside of the validity range of given vat definition
  // and no historic export id was set, we expect to not get any export id
  // at all.
  t.falsy(vatExportId);
});

test('Get vat definition export id and definition for an export', (t) => {
  const pointInTime = new Date('2021-01-01 00:00:00');

  // Retrieve historic export id with its definition.
  {
    const result = list.getExportIdAndVatDefinitionForExport(
      'e8721881-e0be-477a-a764-416e6b1f4541',
      null,
      pointInTime,
    );
    t.is(result.exportId, 11);
    t.is(result.definition.percentage, '19.00');
    t.is(result.definition.revision, 0);
  }

  // Retrieve another historic export id with its definition.
  {
    const result = list.getExportIdAndVatDefinitionForExport(
      '3f344a4f-78de-4ea7-b698-e2977cbe66b0',
      null,
      pointInTime,
    );
    t.is(result.exportId, 21);
    t.is(result.definition.percentage, '16.00');
    t.is(result.definition.revision, 0);
  }

  // Retrieve current system vat definition
  {
    const result = list.getExportIdAndVatDefinitionForExport(
      'ad1c8bd7-a2ae-42c7-a380-7ef10c1e4d07',
      null,
      pointInTime,
    );
    t.is(result.exportId, 1);
    t.is(result.definition.percentage, '19.00');
    t.is(result.definition.revision, 0);
  }

  // Retrieve current system vat definition but set historic export id
  {
    const result = list.getExportIdAndVatDefinitionForExport(
      'ad1c8bd7-a2ae-42c7-a380-7ef10c1e4d07',
      21,
      pointInTime,
    );
    t.is(result.exportId, 21);
    t.is(result.definition.percentage, '16.00');
    t.is(result.definition.revision, 0);
  }

  // Retrieve custom vat definition
  {
    const result = list.getExportIdAndVatDefinitionForExport(
      '9beef965-07ce-4c9e-a528-9b262e74ef37',
      null,
      pointInTime,
    );
    t.is(result.exportId, 2001);
    t.is(result.definition.percentage, '20.00');
    t.is(result.definition.revision, 0);
  }

  // Retrieve custom vat definition
  {
    const result = list.getExportIdAndVatDefinitionForExport(
      'a0257611-5657-492c-947f-87b04e01d08c',
      null,
      pointInTime,
    );
    t.is(result.exportId, 2001);
    t.is(result.definition.percentage, '21.00');
    t.is(result.definition.revision, 1);
  }
});

test('Get vat definition with by historic export id and making sure to keep it', (t) => {
  // Get vat definition with historic_export_id set
  {
    const result = list.getVatDefinitionByExportIdHoldingHistoric(
      1,
      new Date('2019-01-01 00:00:00'),
    );
    t.truthy(result);
    t.is(result.vat_definition_id, 'e8721881-e0be-477a-a764-416e6b1f4541');
    t.is(result.vat_definition_export_id, 1);
    t.is(result.historic_export_id, 11);
  }

  // Get the same vat definition via the historic_export_id but keeping it as
  // the main vat_definition_export_id
  {
    const result = list.getVatDefinitionByExportIdHoldingHistoric(
      11,
      new Date('2019-01-01 00:00:00'),
    );
    t.truthy(result);
    t.is(result.vat_definition_id, 'e8721881-e0be-477a-a764-416e6b1f4541');
    t.is(result.vat_definition_export_id, 11);
    t.is(result.historic_export_id, 11);
  }
});
