import sql from '../db';
import { RequestEntity } from '../models/db';

export async function insertRequest(input: RequestEntity) {
  input.body = sql.json(input.body);

  await sql`
    INSERT INTO requests 
      ${sql(
        input,
        'request_id',
        'path',
        'body',
        'time_creation',
        'organization_id',
        'env',
        'version',
      )}
  `;
}
