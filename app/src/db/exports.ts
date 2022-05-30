import sql, { getKnex } from '../db';
import { ExportEntity, ExportCashPointClosingEntity } from '../models/db';
import { ExportStateType } from '../models';
import { OrganizationId, Env, ExportOrderBy } from '../routes/api/models';
import { logTime } from '../lib/metrics';
import { FastifyRequest } from 'fastify';
import knexMapStreamHandler from './knexMapStreamHandler';
import { add, parseISO } from 'date-fns';

export async function selectExport(
  organizationId: OrganizationId,
  exportId: string,
  sqlClient = sql,
): Promise<ExportEntity | null> {
  const selectExportTime = logTime('selectExport');
  const result = await sqlClient<ExportEntity>`
    SELECT * 
    FROM exports 
    WHERE 
      export_id = ${exportId} 
      AND organization_id = ${organizationId}
  `;
  await selectExportTime.end();
  return result?.[0] || null;
}

interface ExportCashPointClosingsResult {
  closingIds: string[];
  signApiVersion?: number;
}

export async function selectCashPointClosingsForExportWithSignApiVersion(
  organization_id: OrganizationId,
  startDate: Date,
  endDate: Date,
  signApiVersion: number,
  clientId?: string,
) {
  const selectCashPointClosingsForExportWithSignApiVersionTime = logTime(
    'selectCashPointClosingsForExportWithSignApiVersion',
  );
  const knex = await getKnex();

  const knexQuery = knex
    .select('cash_point_closing_id')
    .from('cash_point_closings')
    .innerJoin(
      'cash_registers',
      'cash_registers.client_id',
      'cash_point_closings.client_id',
    )
    .where('cash_registers.organization_id', organization_id)
    .whereBetween('cash_point_closings.time_creation', [startDate, endDate])
    .andWhere('cash_point_closings.state', 'COMPLETED')
    .andWhere('cash_point_closings.sign_api_version', signApiVersion);
  if (clientId) {
    knexQuery.andWhere('cash_point_closings.client_id', clientId);
  }

  const result = await knexMapStreamHandler(
    knexQuery.stream(),
    'cash_point_closing_id',
  );

  // Using a Set to be sure to not have duplicates, even though the db structure should not allow duplicates here anyway.
  const closingIds: Set<string> = new Set([...Object.keys(result)]);

  await selectCashPointClosingsForExportWithSignApiVersionTime.end();
  return Array.from(closingIds);
}

export async function selectCashPointClosingsForExport(
  organization_id: OrganizationId,
  startdate: Date,
  enddate: Date,
  clientId?: string,
  request?: FastifyRequest,
  limit?: number,
  selectedSignApiVersion?: number,
): Promise<ExportCashPointClosingsResult> {
  const selectCashPointClosingsForExportTime = logTime(
    'selectCashPointClosingsForExport',
    request,
  );
  // Using a Set to be sure to not have duplicates, even though the db structure should not allow duplicates here anyway.
  const closingIds: Set<string> = new Set();
  let signApiVersion: number = selectedSignApiVersion;

  // Ordering by sign_api_version DESC so the highest number is the first to be set as the main signApiVersion.
  await sql<ExportCashPointClosingEntity>`
      SELECT cash_point_closing_id, cash_point_closings.sign_api_version
      FROM cash_point_closings
      INNER JOIN cash_registers ON cash_point_closings.client_id = cash_registers.client_id
      WHERE cash_registers.organization_id = ${organization_id}
      AND cash_point_closings.time_creation BETWEEN ${startdate} AND ${enddate}
      AND (${clientId}::uuid IS NULL OR cash_point_closings.client_id = ${clientId})
      AND cash_point_closings.state = 'COMPLETED'
      ORDER BY cash_point_closings.sign_api_version DESC NULLS LAST
      LIMIT ${limit};
    `.stream((row: ExportCashPointClosingEntity) => {
    if (signApiVersion == null) {
      signApiVersion = row.sign_api_version;
    }
    if (row.sign_api_version !== signApiVersion) {
      return;
    }
    closingIds.add(row.cash_point_closing_id);
  });

  await selectCashPointClosingsForExportTime.end();
  return {
    closingIds: Array.from(closingIds),
    signApiVersion,
  };
}

export async function hasCashPointClosingsForExports(
  organization_id: OrganizationId,
  startdate: Date,
  enddate: Date,
  clientId?: string,
  request?: FastifyRequest,
) {
  const { closingIds, signApiVersion } = await selectCashPointClosingsForExport(
    organization_id,
    startdate,
    enddate,
    clientId,
    request,
    1,
  );

  return {
    hasCashPointClosings: closingIds.length > 0,
    signApiVersion,
  };
}

export async function insertExport(
  exportEntity: ExportEntity,
  transaction?,
  request?,
): Promise<ExportEntity | null> {
  const insertExportsTime = logTime('insertExport', request);

  let thisSql = sql;

  if (transaction) {
    thisSql = transaction;
  }

  exportEntity.error_details = exportEntity.error_details
    ? sql.json(exportEntity.error_details)
    : undefined;
  exportEntity.metadata = exportEntity.metadata
    ? sql.json(exportEntity.metadata)
    : undefined;
  exportEntity.input_query = exportEntity.input_query
    ? sql.json(exportEntity.input_query)
    : undefined;

  const result = await thisSql`
    INSERT INTO exports
    ${thisSql(
      [exportEntity],
      'export_id',
      'organization_id',
      'export_state',
      'input_query',
      'input_query_result_hash',
      'error_message',
      'error_details',
      'time_request',
      'time_start',
      'time_end',
      'time_expiration',
      'time_error',
      'bucket',
      'object',
      'download_checksum',
      'metadata',
      'env',
      'version',
      'sign_api_version',
      'request_id',
    )}
    RETURNING *
  `;

  await insertExportsTime.end();
  return result[0] || null;
}

export async function exportHasBeenTriggeredBefore(
  exportId: string,
  cashPointClosingIds: string[],
) {
  if (!cashPointClosingIds.length) {
    return;
  }

  const knex = await getKnex();
  const result = await knex('export_cash_point_closings')
    .where('export_id', exportId)
    .whereIn('cash_point_closing_id', cashPointClosingIds)
    .count('*')
    .first();
  return !!parseInt(result.count);
}

export async function insertExportCashPointClosingIds(
  exportId: string,
  cashPointClosingIds: string[],
): Promise<void> {
  const insertExportCashPointClosingIdsTime = logTime(
    'insertExportCashPointClosingIds',
  );

  const inputs: ExportCashPointClosingEntity[] = [];

  for (const cashPointClosingId of cashPointClosingIds) {
    inputs.push({
      export_id: exportId,
      cash_point_closing_id: cashPointClosingId,
    });
  }

  const knex = await getKnex();

  // TODO Perf: why would we wait here?
  await knex('export_cash_point_closings').insert(inputs);

  await insertExportCashPointClosingIdsTime.end();
}

export async function updateExportState(
  exportId: string,
  exportStatus: ExportStateType,
  time_field: 'time_start' | 'time_end' | 'time_expiration' | 'time_error',
): Promise<ExportEntity | null> {
  // TODO this is an async function - so we could return promises ;-)
  const result = await sql`
    UPDATE exports 
    SET export_state = ${exportStatus}, ${sql(time_field)} = NOW()
    WHERE export_id = ${exportId}
    RETURNING *
  `;
  // TODO Discuss - even if multiple exports are inserted, only [0] is returned?
  return result[0] || null;
}

export async function setExportError(
  exportId: string,
  errorCode: string,
  errorMessage: string,
  error: unknown,
): Promise<ExportEntity | null> {
  // TODO this is an async function - so we could return promises ;-)
  const result = await sql`
    UPDATE exports
    SET export_state = 'ERROR', time_error = NOW(), error_code = ${errorCode}, error_message = ${errorMessage}, error_details = ${sql.json(
    error,
  )}
    WHERE export_id = ${exportId}
    RETURNING *
  `;
  // TODO Discuss - even if multiple exports are inserted, only [0] is returned?
  return result[0] || null;
}

export async function completeExport(
  exportId: string,
  bucket: string,
  filename: string,
): Promise<void> {
  // TODO this is an async function - so we could return promises ;-)
  const result = await sql`
    UPDATE exports 
    SET export_state = 'COMPLETED', time_end = NOW(), bucket = ${bucket}, object = ${filename}
    WHERE export_id = ${exportId}
    RETURNING *
  `;
  return result[0] || null;
}

export async function setExportMetadata(
  exportId: string,
  metadata: Record<string, unknown>,
): Promise<ExportEntity> {
  // TODO this is an async function - so we could return promises ;-)
  const result = await sql`
  UPDATE exports 
  SET metadata = ${sql.json(metadata)}
  WHERE export_id = ${exportId}
  RETURNING *
`;
  return result[0] || null;
}

interface SelectExportsArguments {
  organization_id: OrganizationId;
  env: Env;
  states: ExportStateType[];
  clientId?: string;
  limit: number;
  offset: number;
  orderBy: ExportOrderBy;
  order: 'asc' | 'desc';
  cashPointClosingId?: string;
  businessDateStart?: string;
  businessDateEnd?: string;
  exportId?: string;
}

export async function selectAllExports(
  args: SelectExportsArguments,
): Promise<[ExportEntity[] | null, number | null]> {
  const {
    organization_id,
    env,
    states = [],
    clientId,
    limit = 100,
    offset = 0,
    orderBy = 'time_request',
    order = 'asc',
    cashPointClosingId,
    businessDateStart,
    businessDateEnd,
    exportId,
  } = args;
  const knex = await getKnex();
  const orderByMap = {
    state: 'export_state',
    time_completed: 'time_end',
  };
  const useOrderBy: string = orderByMap[orderBy] || orderBy;

  let query = knex
    .from('exports')
    .where('exports.env', env)
    .andWhere('exports.organization_id', organization_id);

  if (exportId != null) {
    query.andWhere('exports.export_id', exportId);
  }

  if (states.length) {
    query.whereIn('export_state', states);
  }

  const additionalFilterFields = [clientId, businessDateStart, businessDateEnd];
  const needsCashPointClosingsJoin = additionalFilterFields.some(
    (field) => !!field,
  );

  if (cashPointClosingId || needsCashPointClosingsJoin) {
    query.innerJoin(
      'export_cash_point_closings',
      'export_cash_point_closings.export_id',
      'exports.export_id',
    );

    if (cashPointClosingId) {
      query.where(
        'export_cash_point_closings.cash_point_closing_id',
        cashPointClosingId,
      );
    }

    if (needsCashPointClosingsJoin) {
      query.innerJoin(
        'cash_point_closings',
        'cash_point_closings.cash_point_closing_id',
        'export_cash_point_closings.cash_point_closing_id',
      );
    }

    if (businessDateStart) {
      query.whereRaw(
        'COALESCE(cash_point_closings.business_date, cash_point_closings.export_creation_date) >= ?',
        [businessDateStart],
      );
    }

    if (businessDateEnd) {
      const businessDateEndPlusOne = add(parseISO(businessDateEnd), {
        hours: 24,
      });
      query.whereRaw(
        'COALESCE(cash_point_closings.business_date, cash_point_closings.export_creation_date) < ?',
        [businessDateEndPlusOne],
      );
    }

    if (clientId) {
      query.where('cash_point_closings.client_id', clientId);
    }
    query.distinctOn('exports.export_id');
    // Overriding query as distinct on makes trouble sorting it and retrieving count
    query = knex.from({ tempTable: query.clone() });
  }

  const { count } = await query.clone().count('*').first();
  const result = await query
    .limit(limit)
    .offset(offset)
    .orderBy(useOrderBy, order);
  const exports: { [key: string]: ExportEntity } = {};
  for (const row of result) {
    exports[row.export_id] = row;
  }

  // As the limit can be 100 at most, we can just query all of them at once
  const cashPointClosings = await knex
    .from('export_cash_point_closings')
    .whereIn('export_id', Object.keys(exports));
  for (const cashPointClosingRow of cashPointClosings) {
    if (!exports[cashPointClosingRow.export_id].cash_point_closings) {
      exports[cashPointClosingRow.export_id].cash_point_closings = [];
    }
    exports[cashPointClosingRow.export_id].cash_point_closings.push(
      cashPointClosingRow.cash_point_closing_id,
    );
  }

  return [Object.values(exports), count];
}

export async function selectOneExport(
  organizationId: OrganizationId,
  exportId: string,
  env: Env,
): Promise<ExportEntity | null> {
  const selectOneExportTime = logTime('selectOneExport');
  const resultArray = await selectAllExports({
    organization_id: organizationId,
    env: env,
    states: [],
    limit: 1,
    offset: 0,
    orderBy: 'time_request',
    order: 'asc',
    exportId: exportId,
  });
  const result = resultArray[0];
  await selectOneExportTime.end();
  return result?.[0] || null;
}
