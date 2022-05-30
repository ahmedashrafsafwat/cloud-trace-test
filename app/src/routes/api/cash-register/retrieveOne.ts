import {
  FastifyInstance,
  RouteShorthandOptions,
  DefaultHeaders,
} from 'fastify';
import stripIndent from 'strip-indent';
import {
  CashRegisterResponseType,
  ClientIdParamsType,
  createHttpErrorType,
  RevisionParamType,
} from '../spec';
import constants from '../../../constants';
import { selectCashRegister } from '../../../db/cash_register';
import { addStandardResponseProperties } from '../../../helpers/utilities';
import { CashRegisterNotFound } from '../../../lib/errors';
import { ClientIdParams, RevisionParam } from '../models';

const routesClient = async (fastify: FastifyInstance) => {
  const opts: RouteShorthandOptions = {
    schema: {
      operationId: 'retrieveCashRegister',
      summary: 'Retrieve a cash register',
      description: stripIndent(`
      Retrieve one cash register. 
    `),
      tags: ['Cash Register'],
      params: ClientIdParamsType,
      querystring: RevisionParamType,
      response: {
        200: CashRegisterResponseType,
        404: createHttpErrorType(404, 'Cash Register does not exist.', [
          constants.E_CASH_REGISTER_NOT_FOUND,
        ]),
      },
    },
    preHandler: [fastify.authenticate],
  };

  fastify.get<RevisionParam, ClientIdParams, DefaultHeaders>(
    '/cash_registers/:client_id',
    opts,
    async (request, reply) => {
      const { client_id } = request.params;
      const { revision } = request.query;

      let result = await selectCashRegister(
        request.token_env,
        request.jwt.claims.organization,
        client_id,
        revision,
      );

      if (!result) {
        throw CashRegisterNotFound(client_id);
      }

      result = addStandardResponseProperties(result, 'CASH_REGISTER');
      reply.send(result);
    },
  );
};

export default routesClient;
