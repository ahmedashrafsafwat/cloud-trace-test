'use-strict';

import {
  FastifyInstance,
  RouteShorthandOptions,
  DefaultQuery,
  DefaultHeaders,
} from 'fastify';
import stripIndent from 'strip-indent';
import {
  createHttpErrorType,
  MetadataRequestType,
  MetadataResponseType,
  ClientIdParamsType,
} from '../spec';
import constants from '../../../constants';
import {
  selectCashRegister,
  updateCashRegisterMetadata,
} from '../../../db/cash_register';
import { CashRegisterNotFound } from '../../../lib/errors';
import { ClientIdParams, MetadataRequest } from '../models';

const upsertCashRegisterMetadata = async (fastify: FastifyInstance) => {
  const upsertCashRegisterMetadataOptions: RouteShorthandOptions = {
    schema: {
      operationId: 'upsertCashRegisterMetadata',
      summary: 'Create or update metadata of a cash register',
      description: stripIndent(`
        Create or update additional structured information about a cash register.
      `),
      tags: ['Cash Register'],
      params: ClientIdParamsType,
      body: MetadataRequestType,
      response: {
        200: MetadataResponseType,
        400: createHttpErrorType(400, 'Request body failed validation.', [
          constants.E_FAILED_SCHEMA_VALIDATION,
        ]),
        404: createHttpErrorType(404, 'Cash Register does not exist.', [
          constants.E_CASH_REGISTER_NOT_FOUND,
        ]),
      },
    },
    preHandler: [fastify.authenticate],
  };

  fastify.put<DefaultQuery, ClientIdParams, DefaultHeaders, MetadataRequest>(
    '/cash_registers/:client_id/metadata',
    upsertCashRegisterMetadataOptions,
    async (request, reply) => {
      const { client_id } = request.params as ClientIdParams;

      const cashRegister = await selectCashRegister(
        request.token_env,
        request.jwt.claims.organization,
        client_id,
      );

      if (!cashRegister) {
        throw CashRegisterNotFound(client_id);
      }

      const result = await updateCashRegisterMetadata(
        request.token_env,
        request.jwt.claims.organization,
        client_id,
        request.body,
      );

      if (result) {
        reply.send(result.metadata);
      } else {
        throw new Error('No result');
      }
    },
  );
};

export default upsertCashRegisterMetadata;
