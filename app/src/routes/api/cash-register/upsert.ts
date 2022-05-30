import {
  FastifyInstance,
  RouteShorthandOptions,
  DefaultQuery,
  DefaultHeaders,
} from 'fastify';
import stripIndent from 'strip-indent';
import {
  createHttpErrorType,
  ClientIdParamsType,
  CashRegisterResponseType,
  CashRegisterRequestType,
} from '../spec';
import constants from '../../../constants';
import {
  ClientIdParams,
  CashRegisterRequest,
  TssId,
  ClientId,
  SerialNumber,
  SignatureTimestampFormat,
  TransactionDataEncoding,
} from '../models';
import { VERSION } from '../../../lib/version';
import {
  upsertCashRegister,
  selectCashRegister,
} from '../../../db/cash_register';
import { CashRegisterNotFound, ClientNotFound } from '../../../lib/errors';
import { CashRegisterEntity } from '../../../models/db';
import { addStandardResponseProperties } from '../../../helpers/utilities';
import { Client, retrieveClient } from '../../../services/kassensichV';
import { tracer } from '../../../server';

// TODO: it is assumed that the organisation is versioned and that historic
//       versions can be retrieved from the Management API. This needs to be implemented
//       in the Management API (or as a lookup service)

async function retrieveSignApiVersionFromClientId(request) {
  const { client_id } = request.params;
  const env = request.token_env;
  const tss_id = (request.body.cash_register_type.tss_id as TssId) || null;

  let client: Client;
  let sign_api_version: number;
  let receivedError: Error;
  const token = `${request.jwt.protected}.${request.jwt.payload}.${request.jwt.signature}`;
  const api_versions = [2, 1];

  for (const api_version of api_versions) {
    try {
      const retireveClient = tracer.createChildSpan({
        name: 'Retireve cLient from SIGN DE with each sign API version',
      });
      client = await retrieveClient(
        env,
        tss_id,
        client_id,
        token,
        api_version,
        request,
      );
      retireveClient.endSpan();
    } catch (e) {
      request.log.warn(e);
      receivedError = e;
    }
    if (client) {
      sign_api_version = api_version;
      break;
    }
  }

  if (!client) {
    throw receivedError || ClientNotFound();
  }

  return sign_api_version;
}

const routesClient = async (fastify: FastifyInstance) => {
  const opts: RouteShorthandOptions = {
    schema: {
      operationId: 'upsertCashRegister',
      summary: 'Insert or update a cash register',
      description: stripIndent(`
      Insert or update a cash register/slave when a client already exists.
      
      
    `),
      tags: ['Cash Register'],
      params: ClientIdParamsType,
      body: CashRegisterRequestType,
      response: {
        200: CashRegisterResponseType,
        400: createHttpErrorType(400, 'Request body failed validation.', [
          constants.E_FAILED_SCHEMA_VALIDATION,
        ]),
        404: createHttpErrorType(
          400,
          'Client or Cash Register does not exist.',
          [
            constants.E_CLIENT_NOT_FOUND,
            constants.E_CASH_REGISTER_NOT_FOUND,
            constants.E_TSS_NOT_FOUND,
          ],
        ),
      },
    },
    preHandler: [fastify.authenticate],
  };

  fastify.put<
    DefaultQuery,
    ClientIdParams,
    DefaultHeaders,
    CashRegisterRequest
  >('/cash_registers/:client_id', opts, async (request, reply) => {
    const upsertCashRegisterReq = tracer.createChildSpan({
      name: 'Upsert cash register request',
    });

    const { client_id } = request.params;

    const {
      cash_register_type,
      base_currency_code,
      brand,
      model,
      software,
      processing_flags,
      metadata,
    } = request.body;

    const env = request.token_env;
    const organization_id = request.jwt.claims.organization;
    const tss_id = (cash_register_type.tss_id as TssId) || null;
    const master_client_id =
      (cash_register_type.master_client_id as ClientId) || null;

    // get external TSS data if exists
    const serial_number =
      (cash_register_type.serial_number as SerialNumber) || null;
    const signature_algorithm =
      (cash_register_type.signature_algorithm as string) || null;
    const signature_timestamp_format =
      (cash_register_type.signature_timestamp_format as SignatureTimestampFormat) ||
      null;
    const transaction_data_encoding =
      (cash_register_type.transaction_data_encoding as TransactionDataEncoding) ||
      null;
    const public_key = (cash_register_type.public_key as string) || null;
    const certificate = (cash_register_type.certificate as string) || null;

    let sign_api_version: number;
    const isExternalTss = ![
      serial_number,
      signature_algorithm,
      signature_timestamp_format,
      transaction_data_encoding,
      public_key,
      certificate,
    ].every((externalTssElement) => externalTssElement === null);
    if (tss_id && !isExternalTss) {
      const retrieveSignApiVersion = tracer.createChildSpan({
        name: 'Retrieve all sign API versions from client ID',
      });
      sign_api_version = await retrieveSignApiVersionFromClientId(request);
      retrieveSignApiVersion.endSpan();
    }

    if (cash_register_type.type !== 'MASTER') {
      const selectCashRegisterSpan = tracer.createChildSpan({
        name: 'Select cash register',
      });
      const masterClient = await selectCashRegister(
        env,
        request.jwt.claims.organization,
        master_client_id,
        null,
        sign_api_version,
      );
      selectCashRegisterSpan.endSpan();

      if (!masterClient) {
        throw CashRegisterNotFound(cash_register_type.master_client_id);
      }

      // For SLAVE_WITHOUT_TSS there was no sign_api_version available. Therefore we use the one from the masterClient.
      if (cash_register_type.type === 'SLAVE_WITHOUT_TSS') {
        sign_api_version = masterClient.sign_api_version;
      }
    }

    const input: CashRegisterEntity = {
      client_id,
      tss_id,
      base_currency_code,
      brand: brand || null,
      model: model || null,
      sw_version: software ? software.version : null,
      sw_brand: software ? software.brand : null,
      vat_not_determineable: processing_flags
        ? processing_flags.UmsatzsteuerNichtErmittelbar
        : false,
      master_client_id,
      version: VERSION,
      organization_id,
      env,
      metadata,
      sign_api_version,
      revision: null,
      serial_number,
      signature_algorithm,
      signature_timestamp_format,
      transaction_data_encoding,
      public_key,
      certificate,
    };

    const upsertCashRegisterSpan = tracer.createChildSpan({
      name: 'Select cash register',
    });
    const result = await upsertCashRegister(input);
    upsertCashRegisterSpan.endSpan();
    if (result) {
      reply.send(addStandardResponseProperties(result, 'CASH_REGISTER'));
      upsertCashRegisterReq.endSpan();
    } else {
      upsertCashRegisterReq.endSpan();
      throw new Error('No result');
    }
  });
};

export default routesClient;
