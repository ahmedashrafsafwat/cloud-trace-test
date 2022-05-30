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
  MetadataResponseType,
  ClientIdParamsType,
} from '../spec';
import constants from '../../../constants';
import { selectCashRegister } from '../../../db/cash_register';
import { CashRegisterNotFound } from '../../../lib/errors';
import { ClientIdParams } from '../models';

const retrieveCashRegisterMetadata = async (fastify: FastifyInstance) => {
  const retrieveCashRegisterMetadataOptions: RouteShorthandOptions = {
    schema: {
      operationId: 'retrieveCashRegisterMetadata',
      summary: 'Retrieve metadata of a cash register',
      description: stripIndent(`
       Retrieve additional structured information about a cash register.
      `),
      tags: ['Cash Register'],
      params: ClientIdParamsType,
      response: {
        200: MetadataResponseType,
        404: createHttpErrorType(404, 'Cash Register does not exist.', [
          constants.E_CASH_REGISTER_NOT_FOUND,
        ]),
      },
    },
    preHandler: [fastify.authenticate],
  };

  fastify.get<DefaultQuery, ClientIdParams, DefaultHeaders>(
    '/cash_registers/:client_id/metadata',
    retrieveCashRegisterMetadataOptions,
    async (request, reply) => {
      const { client_id } = request.params;

      const result = await selectCashRegister(
        request.token_env,
        request.jwt.claims.organization,
        client_id,
      );

      if (!result) {
        throw CashRegisterNotFound(client_id);
      }

      reply.send(result.metadata || {});
    },
  );
};

export default retrieveCashRegisterMetadata;
