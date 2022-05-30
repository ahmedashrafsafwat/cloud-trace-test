import { Knex } from 'knex';
import { getKnex } from '../db';
import config from '../config';
const batchCount = config.BATCH_COUNT;

export async function batchInsert(sql, tableName, columns, data, isReturn) {
  const returnResults = [];
  for (let i = 0; i < data.length; i += batchCount) {
    const sliced = data.slice(i, i + batchCount);

    if (isReturn) {
      const result = await sql`
        INSERT INTO ${sql(tableName)}
        ${sql(sliced, ...columns)}
        RETURNING *
        `;

      if (result.length) returnResults.push(...result);
    } else {
      await sql`
        INSERT INTO ${sql(tableName)}
        ${sql(sliced, ...columns)}
      `;
    }
  }
  return returnResults;
}

export async function knexBatchInsert(
  tableName: Knex.TableDescriptor,
  data: readonly any[],
  trx?: Knex.Transaction,
) {
  try {
    const knex = getKnex();

    const query = knex.batchInsert(tableName, data, batchCount);
    if (trx) {
      query.transacting(trx);
    }

    return query;
  } catch (err) {
    console.error(err);
    throw new Error(
      `Error in knexBatchInsert when inserting into ${tableName}: ${JSON.stringify(
        err,
      )}`,
    );
  }
}
