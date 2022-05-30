import sql, { getKnex } from '../db';
import {
  Env,
  Revision,
  OrganizationId,
  Metadata,
  PurchaserAgencyId,
  ClientId,
  PurchaserAgencyCollectionQuerystring,
  SignApiVersionType,
} from '../routes/api/models';
import {
  hasObjectChanged,
  addStandardResponseProperties,
} from '../helpers/utilities';
import SqlString from 'sqlstring';
import { PurchaserAgencieEntity } from '../models/db';
import appendSignApiVersionQuery from './appendSignApiVersionQuery';
import { knexMapCallbackStreamHandler } from './knexMapStreamHandler';

export interface PurchaserAgencyInput
  extends Omit<PurchaserAgencieEntity, 'revision'> {
  revision?: Revision;
  sign_api_version: SignApiVersionType;
}

export interface PurchaserAgenciesWithCashPointClosingId {
  purchaser_agency_id: string;
  purchaser_agency_export_id: string;
  revision: number;
  name: string;
  address: any;
  tax_number: string;
  vat_id_number: string;
  cash_point_closing_id: string;
}

// function overloading
export async function selectPurchaserAgency(
  env: Env[],
  organization_id: OrganizationId[],
  purchaser_agency_id: PurchaserAgencyId[],
  revision?: Revision,
  sign_api_version?: SignApiVersionType,
): Promise<PurchaserAgencieEntity[] | null>;
export async function selectPurchaserAgency(
  env: Env,
  organization_id: OrganizationId,
  purchaser_agency_id: PurchaserAgencyId[],
  revision?: Revision,
  sign_api_version?: SignApiVersionType,
): Promise<PurchaserAgencieEntity[] | null>;
export async function selectPurchaserAgency(
  env: Env,
  organization_id: OrganizationId,
  purchaser_agency_id: PurchaserAgencyId,
  revision?: Revision,
  sign_api_version?: SignApiVersionType,
): Promise<PurchaserAgencieEntity | null>;

export async function selectPurchaserAgency(
  env: any,
  organization_id: any,
  purchaser_agency_id: any,
  revision?: Revision,
  sign_api_version?: SignApiVersionType,
): Promise<any | null> {
  const knex = getKnex();
  const query = knex.from('purchaser_agencies');

  if (typeof env == 'string') {
    query.where('env', env);
  } else {
    query.whereIn('env', env);
  }

  if (typeof organization_id == 'string') {
    query.andWhere('organization_id', organization_id);
  } else {
    query.whereIn('organization_id', organization_id);
  }

  if (typeof purchaser_agency_id == 'string') {
    query.andWhere('purchaser_agency_id', purchaser_agency_id);
  } else {
    query.whereIn('purchaser_agency_id', purchaser_agency_id);
  }

  if (revision) {
    query.andWhere('revision', revision);
  } else {
    const innerQuery = knex.from('purchaser_agencies').max('revision');

    if (typeof purchaser_agency_id == 'string') {
      innerQuery.where('purchaser_agency_id', purchaser_agency_id);
    } else {
      innerQuery.whereIn('purchaser_agency_id', purchaser_agency_id);
    }
    query.andWhere('revision', innerQuery);
  }

  const finalKnexQuery = appendSignApiVersionQuery(query, sign_api_version);

  const result = await finalKnexQuery;

  return typeof purchaser_agency_id == 'string'
    ? result[0] || null
    : result || null;
}

export async function selectPurchaserAgenciesMapByExportId(
  exportId: string,
  readFromReplica = false,
) {
  const fields = [
    'a.purchaser_agency_id',
    'a.purchaser_agency_export_id',
    'a.revision',
    'a.name',
    'a.address',
    'a.tax_number',
    'a.vat_id_number',
  ];
  const knex = getKnex(readFromReplica);
  const query = knex
    .select(...fields, 'b.cash_point_closing_id')
    .from({ a: 'purchaser_agencies' })
    .innerJoin({ b: 'business_cases' }, function () {
      this.on('a.purchaser_agency_id', 'b.purchaser_agency_id').on(
        'a.revision',
        'b.purchaser_agency_revision',
      );
    })
    .innerJoin(
      { e: 'export_cash_point_closings' },
      'b.cash_point_closing_id',
      'e.cash_point_closing_id',
    )
    .where('e.export_id', exportId)
    .unionAll([
      knex
        .select(...fields, 'l.cash_point_closing_id')
        .from({ a: 'purchaser_agencies' })
        .innerJoin({ l: 'lineitems' }, function () {
          this.on('a.purchaser_agency_id', 'l.purchaser_agency_id').on(
            'a.revision',
            'l.purchaser_agency_revision',
          );
        })
        .innerJoin(
          { e: 'export_cash_point_closings' },
          'l.cash_point_closing_id',
          'e.cash_point_closing_id',
        )
        .where('export_id', exportId),
    ]);
  return knexMapCallbackStreamHandler<
    PurchaserAgenciesWithCashPointClosingId,
    PurchaserAgenciesWithCashPointClosingId[]
  >(query.stream(), (row, output) => {
    if (!output[row.purchaser_agency_id]) {
      output[row.purchaser_agency_id] = [];
    }
    output[row.purchaser_agency_id][row.revision] = row;
  });
}

async function selectMaxExportId(
  env: Env,
  organization_id: OrganizationId,
  _client_id: ClientId,
): Promise<number | null> {
  // TODO: Should index remain on (purchaser_agency_export_id, organization_id, revision) or should
  // client_id be added to index as well.
  const result = await sql`
    SELECT max(purchaser_agency_export_id) as maxexportid
    FROM purchaser_agencies
    WHERE env = ${env}
    AND organization_id = ${organization_id};
  `;

  return result[0] ? result[0].maxexportid : null;
}

export async function selectAllPurchaserAgencies(
  env: Env,
  organization_id: OrganizationId,
  query?: PurchaserAgencyCollectionQuerystring,
): Promise<[PurchaserAgencieEntity[], number]> {
  const result: PurchaserAgencieEntity[] = [];

  let sqlQuery = `
    FROM purchaser_agencies a
    INNER JOIN (
      SELECT purchaser_agency_id, MAX(revision) as maxRevision
      FROM purchaser_agencies
      GROUP BY purchaser_agency_id
    ) b 
    ON a.purchaser_agency_id = b.purchaser_agency_id AND a.revision = b.maxRevision
    WHERE env = ${SqlString.escape(env)}
    AND organization_id = ${SqlString.escape(organization_id)}
  `;

  let sqlParameterQuery = ``;

  if (query) {
    const { client_id, order_by, order, limit, offset } = query;

    if (typeof client_id === 'string') {
      sqlQuery = sqlQuery.concat(
        `AND client_id = ${SqlString.escape(client_id)} `,
      );
    }
    sqlParameterQuery = sqlParameterQuery.concat(
      `ORDER BY ${order_by} ${order} `,
    );
    if (typeof limit === 'number') {
      sqlParameterQuery = sqlParameterQuery.concat(
        `LIMIT ${SqlString.escape(limit)} `,
      );
    }
    if (typeof offset === 'number') {
      sqlParameterQuery = sqlParameterQuery.concat(
        `OFFSET ${SqlString.escape(offset)} `,
      );
    }
  }

  const sqlCountQuery = `
  SELECT COUNT(*) ${sqlQuery}
`;
  const sqlResultQuery = `
  SELECT * ${sqlQuery} ${sqlParameterQuery}
`;

  const { count } = (await sql.unsafe(sqlCountQuery))[0];
  await sql.unsafe(sqlResultQuery).stream((row: PurchaserAgencieEntity) => {
    result.push(addStandardResponseProperties(row, 'PURCHASER_AGENCY'));
  });

  return [result, count];
}

export async function updatePurchaserAgencyMetadata(
  env: Env,
  organization_id: OrganizationId,
  purchaser_agency_id: PurchaserAgencyId,
  metadata: Metadata,
): Promise<PurchaserAgencieEntity> {
  const input = {
    metadata: metadata ? sql.json(metadata) : undefined,
  };

  const updatedPurchaserAgency = await sql`
    UPDATE purchaser_agencies
    SET
      ${sql(input, 'metadata')}
    WHERE env = ${env}
    AND organization_id = ${organization_id}
    AND purchaser_agency_id = ${purchaser_agency_id}
    AND revision =
      (SELECT MAX(revision) FROM purchaser_agencies WHERE purchaser_agency_id = ${purchaser_agency_id})
    RETURNING *
  `;

  return updatedPurchaserAgency[0];
}

export async function insertOrUpdatePurchaserAgency(
  purchaserAgency: PurchaserAgencyInput,
): Promise<PurchaserAgencieEntity> {
  const existingPurchaserAgency = await selectPurchaserAgency(
    purchaserAgency.env,
    purchaserAgency.organization_id,
    purchaserAgency.purchaser_agency_id,
  );

  if (!existingPurchaserAgency) {
    const maxExportId = await selectMaxExportId(
      purchaserAgency.env,
      purchaserAgency.organization_id,
      purchaserAgency.client_id,
    );

    purchaserAgency.purchaser_agency_export_id = maxExportId
      ? maxExportId + 1
      : 1;
  } else {
    purchaserAgency.purchaser_agency_export_id =
      existingPurchaserAgency.purchaser_agency_export_id;
  }

  const somethingChanged = hasObjectChanged({
    newObject: purchaserAgency,
    oldObject: existingPurchaserAgency,
    checkKeys: ['name', 'address', 'tax_number', 'client_id', 'vat_id_number'],
  });

  if (somethingChanged) {
    const input = purchaserAgency;
    input.revision = existingPurchaserAgency
      ? existingPurchaserAgency.revision + 1
      : 0;
    input.time_creation = new Date();
    input.time_update = new Date();
    input.address = sql.json(purchaserAgency.address);
    input.metadata = sql.json(purchaserAgency.metadata);

    const newPurchaserAgency = await sql`
      INSERT INTO purchaser_agencies
        ${sql(
          input,
          'purchaser_agency_id',
          'revision',
          'purchaser_agency_export_id',
          'organization_id',
          'name',
          'tax_number',
          'client_id',
          'address',
          'vat_id_number',
          'env',
          'version',
          'metadata',
          'time_creation',
          'time_update',
          'sign_api_version',
        )}
      RETURNING *
    `;

    if (newPurchaserAgency[0]) {
      return newPurchaserAgency[0];
    } else {
      throw new Error('INSERT did not return data');
    }
  } else if (purchaserAgency.metadata) {
    return await updatePurchaserAgencyMetadata(
      purchaserAgency.env,
      purchaserAgency.organization_id,
      purchaserAgency.purchaser_agency_id,
      purchaserAgency.metadata,
    );
  }

  return existingPurchaserAgency;
}
