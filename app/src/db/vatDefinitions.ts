import sql, { getKnex } from '../db';
import {
  Env,
  Revision,
  OrganizationId,
  Metadata,
  VatDefinitionExportId,
  VatDefinitionsCollectionQuerystring,
} from '../routes/api/models';
import { hasObjectChanged } from '../helpers/utilities';
import { VatDefinitionEntity } from '../models/db';
import { VatDefinitionSelection } from '../helpers/vatDefinitionPicker';

export interface VatDefinitionInput
  extends Omit<VatDefinitionEntity, 'revision'> {
  revision?: Revision;
}

export async function selectVatDefinition(
  env: Env,
  organization_id: OrganizationId,
  vat_definition_export_id: VatDefinitionExportId,
  revision?: Revision,
): Promise<VatDefinitionEntity | null> {
  const knex = getKnex();

  const query = knex.from('vat_definitions').where({
    env,
    organization_id,
    vat_definition_export_id,
  });

  if (revision) {
    query.andWhere({ revision });
  } else {
    query.andWhere('revision', query.clone().max('revision'));
  }

  return query.first();
}

export async function selectAllVatDefinitions(
  env: Env,
  organization_id: OrganizationId,
  queryParameters?: VatDefinitionsCollectionQuerystring,
  includeSystemVatDefinitions = false,
): Promise<[VatDefinitionEntity[], number | null]> {
  const knex = getKnex();
  const query = knex
    .select(
      'vat_definition_id',
      'a.vat_definition_export_id',
      'percentage',
      'description',
      'time_creation',
      'time_update',
      'version',
      'a.revision',
      knex.raw('NULL as dsfinvk_version'),
      'env',
      knex.raw('NULL as historic_export_id'),
      'metadata',
    )
    .from({ a: 'vat_definitions' })
    .innerJoin(
      knex.raw(
        `
        (SELECT
          vat_definition_export_id,
          MAX(revision) as revision
        FROM vat_definitions
        WHERE env = ?
        AND organization_id = ?
        GROUP BY vat_definition_export_id) b
    `,
        [env, organization_id],
      ),
      function () {
        this.on(
          'a.vat_definition_export_id',
          'b.vat_definition_export_id',
        ).andOn('a.revision', 'b.revision');
      },
    )
    .where({ env, organization_id });

  let countQuery;
  if (includeSystemVatDefinitions) {
    query.unionAll([
      knex
        .select(
          'vat_definition_id',
          'c.vat_definition_export_id',
          'percentage',
          'description',
          'time_creation',
          'time_update',
          knex.raw('NULL as version'),
          knex.raw('NULL as revision'),
          'dsfinvk_version',
          knex.raw('env::Environment'),
          'historic_export_id',
          knex.raw('NULL as metadata'),
        )
        .from({ c: 'system_vat_definitions' })
        .where({ env })
        .andWhere('validity', '@>', knex.raw('NOW()::timestamp')),
    ]);
    countQuery = knex.from({ countQuery: query.clone() }).count('*').first();
  } else {
    countQuery = query.clone().clearSelect().count('*').first();
  }

  if (queryParameters) {
    const {
      order_by = 'time_creation',
      order = 'asc',
      limit = 100,
      offset = 0,
    } = queryParameters;

    query
      .orderBy(order_by, order)
      .orderBy('vat_definition_export_id')
      .offset(offset)
      .limit(limit);
  }

  return Promise.all([query, countQuery.then(({ count }) => count)]);
}

export async function getVatDefinitions(
  organizationId: OrganizationId,
  env: Env,
  readFromReplica = false,
): Promise<VatDefinitionSelection[]> {
  const knex = getKnex(readFromReplica);
  return knex
    .from({ v: 'vat_definitions' })
    .select(
      'v.vat_definition_id',
      'v.revision',
      'v.vat_definition_export_id',
      knex.raw('NULL as historic_export_id'),
      'v.organization_id',
      'v.percentage',
      'v.description',
      knex.raw('v.env::varchar(4)'),
      'v.version',
      knex.raw('NULL as validity'),
    )
    .where('organization_id', organizationId)
    .andWhere({ env })
    .unionAll([
      knex
        .from({ s: 'system_vat_definitions' })
        .select(
          's.vat_definition_id',
          knex.raw('0 as revision'),
          's.vat_definition_export_id',
          's.historic_export_id',
          knex.raw('NULL as organization_id'),
          's.percentage',
          's.description',
          's.env',
          knex.raw('0 as version'),
          's.validity',
        )
        .where({ env }),
    ]);
}

export async function updateVatDefinitionMetadata(
  env: Env,
  organization_id: OrganizationId,
  vat_definition_export_id: VatDefinitionExportId,
  metadata: Metadata,
): Promise<VatDefinitionEntity> {
  const input = {
    metadata: metadata ? sql.json(metadata) : undefined,
  };

  const updatedVatDefinition = await sql`
    UPDATE vat_definitions SET 
      ${sql(input, 'metadata')}
    WHERE env = ${env}
    AND organization_id = ${organization_id} 
    AND vat_definition_export_id = ${vat_definition_export_id} 
    AND revision = 
      (SELECT MAX(revision) FROM vat_definitions WHERE env = ${env} AND organization_id = ${organization_id} AND vat_definition_export_id = ${vat_definition_export_id})
    RETURNING *
  `;

  return updatedVatDefinition[0];
}

export async function insertOrUpdateVatDefinition(
  vatDefinition: VatDefinitionInput,
): Promise<VatDefinitionEntity> {
  const existingVatDefinition = await selectVatDefinition(
    vatDefinition.env,
    vatDefinition.organization_id,
    vatDefinition.vat_definition_export_id,
  );

  const somethingChanged = hasObjectChanged({
    newObject: vatDefinition,
    oldObject: existingVatDefinition,
    checkKeys: ['percentage', 'description'],
  });

  if (somethingChanged) {
    const input = vatDefinition;
    input.revision = existingVatDefinition
      ? existingVatDefinition.revision + 1
      : 0;
    input.time_creation = new Date();
    input.time_update = new Date();
    input.metadata = vatDefinition.metadata
      ? sql.json(vatDefinition.metadata)
      : undefined;

    const newVatDefinition = await sql`
      INSERT INTO vat_definitions 
        ${sql(
          input,
          'vat_definition_id',
          'revision',
          'vat_definition_export_id',
          'organization_id',
          'percentage',
          'description',
          'env',
          'version',
          'metadata',
          'time_creation',
          'time_update',
        )} 
      RETURNING *
    `;

    if (newVatDefinition[0]) {
      return newVatDefinition[0];
    } else {
      throw new Error('INSERT did not return data');
    }
  } else if (vatDefinition.metadata) {
    return updateVatDefinitionMetadata(
      vatDefinition.env,
      vatDefinition.organization_id,
      vatDefinition.vat_definition_export_id,
      vatDefinition.metadata as Metadata,
    );
  }

  return existingVatDefinition;
}
