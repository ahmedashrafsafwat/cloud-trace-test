import got from 'got';
import { CountryCode, Envs } from '../routes/api/models';
import constants from '../constants';
import { logTime } from '../lib/metrics';
import { FastifyRequest } from 'fastify';

export interface Organization {
  _id: string;
  _type: string;
  _envs: Envs;
  name: string;
  address_line1: string;
  zip: string;
  town: string;
  country_code: CountryCode;
  vat_id?: string;
  contact_person_id?: string;
  address_line2?: string;
  state?: string;
  tax_number?: string;
  economy_id?: string;
  billing_address_id?: string;
  metadata?: any;
  managed_by_organization_id?: string;
  managed_configuration?: any;
}

export async function retrieveOrganization(
  request: FastifyRequest,
  redis: any,
): Promise<Organization | null> {
  const { accessToken, token_env: env } = request;
  const organizationId = request.jwt.claims.organization;
  if (!env || !organizationId || !accessToken) {
    throw new Error('Missing env, organization_id or access_token');
  }

  async function cacheOrganizationInfo(info: any) {
    await redis.set(
      constants.REDIS_ORGANIZATION_KEY_PREFIX + organizationId,
      JSON.stringify(info),
      'EX',
      60,
    );
  }

  async function getCachedOrganizationInfo() {
    const cached = await redis.get(
      constants.REDIS_ORGANIZATION_KEY_PREFIX + organizationId,
    );
    if (cached) {
      return JSON.parse(cached);
    }

    return false;
  }

  async function retrieveFromManagementApi() {
    const url = `${constants.DASHBOARD_URL}/api/v0/organizations/${organizationId}`;
    try {
      const result = await got(url, {
        responseType: 'json',
        method: 'get',
        throwHttpErrors: false,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const { statusCode } = result;

      // todo: pass error codes to the calling function
      if (statusCode !== 200) {
        return null;
      }

      return result.body as Organization;
    } catch (error) {
      console.error(error);
      throw new Error('Could not fetch Organization');
    }
  }

  const retrieveOrganizationTime = logTime('retrieveOrganization', request);

  const cached = await getCachedOrganizationInfo();
  if (cached) {
    await retrieveOrganizationTime.end();
    return cached;
  }

  const result = await retrieveFromManagementApi();
  await cacheOrganizationInfo(result);

  await retrieveOrganizationTime.end();
  return result;
}
