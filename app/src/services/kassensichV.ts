import got, { Response } from 'got';
import createError from 'http-errors';
import { TssId, Env, ClientId, Version } from '../routes/api/models';
import constants from '../constants';
import { FastifyRequest } from 'fastify';

export interface Client {
  serial_number?: string;
  time_creation?: number;
  time_update?: number;
  tss_id?: string;
  metadata?: any;
  _id?: string;
  _type?: string;
  _env?: Env;
  _version?: Version;
}

export async function retrieveClient(
  env: Env,
  tss_id: TssId,
  client_id: ClientId,
  access_token: string,
  api_version: number,
  request: FastifyRequest,
): Promise<Client | null> {
  if (!env || !tss_id || !client_id || !access_token) {
    throw new Error('Missing env, tss_id, client_id or access_token');
  }

  const organization_id = request.jwt.claims.organization;
  const url = `${constants.KASSENSICHV_URL}/api/v${api_version}/tss/${tss_id}/client/${client_id}`;

  let result: Response;
  try {
    result = await got(url, {
      method: 'get',
      responseType: 'json',
      throwHttpErrors: false,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${access_token}`,
      },
    });
  } catch (error) {
    request.log.warn(error);
    request.log.warn(
      `Could not fetch client ${client_id}! Current token has ${JSON.stringify({
        env,
        organization_id,
      })}; `,
    );
    throw new Error(`Could not fetch client ${client_id} with env ${env}`);
  }

  const { statusCode } = result;

  if (statusCode !== 200) {
    let body: any = {};
    try {
      body = result.body;
    } catch (e) {
      console.error(e);
    }
    const message = body.message || 'Unknown';
    console.warn(
      `Error when creating cash register ${client_id}: ${statusCode} ${JSON.stringify(
        {
          url,
          api_version,
          result: body,
        },
      )}`,
    );
    throw createError(statusCode, message, {
      code: body.code || 'E_UNKNOWN',
    });
  }
  return result.body as Client;
}
