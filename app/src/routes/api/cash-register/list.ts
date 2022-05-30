import {
  FastifyInstance,
  RouteShorthandOptions,
  DefaultParams,
  DefaultHeaders,
} from 'fastify';
import stripIndent from 'strip-indent';
import {
  CashRegistersResponseType,
  CashRegisterQuerystringType,
} from '../spec';
import { selectAllCashRegisters } from '../../../db/cash_register';
import { VERSION, toString } from '../../../lib/version';
import { CashRegisterCollectionQuerystring } from '../models';

const routesClient = async (fastify: FastifyInstance) => {
  const opts: RouteShorthandOptions = {
    schema: {
      operationId: 'listCashRegisters',
      summary: 'List all cash registers',
      description: stripIndent(`
      Lists all cash registers. 
    `),
      tags: ['Cash Register'],
      querystring: CashRegisterQuerystringType,
      response: {
        200: CashRegistersResponseType,
      },
    },
    preHandler: [fastify.authenticate],
  };

  fastify.get<CashRegisterCollectionQuerystring, DefaultParams, DefaultHeaders>(
    '/cash_registers',
    opts,
    async (request, reply) => {
      const [result, count] = await selectAllCashRegisters(
        request.token_env,
        request.jwt.claims.organization,
        request.query,
      );

      reply.send({
        data: result,
        count: count,
        _type: 'CASH_REGISTERS',
        _env: request.token_env,
        _version: toString(VERSION),
      });
    },
  );
};

export default routesClient;
