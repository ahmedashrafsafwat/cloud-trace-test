import { FastifyInstance } from 'fastify';
import healthz from './healthz';
import api from './api';
import sql, { closeAllKnexConnections, sqlRead } from '../db/index';
import Queue from '../queue/Queue';
import { majorVersion } from './api/spec';

export default async function (fastify: FastifyInstance) {
  fastify.register(healthz);
  fastify.register(api);
  fastify.get('/', (_, reply) => {
    reply.redirect(`/api/v${majorVersion}/_docs/`);
  });

  fastify.addHook('onClose', async () => {
    await sql.end({ timeout: 5 });
    await sqlRead.end({ timeout: 5 });
    await closeAllKnexConnections();
    await Queue.close();
  });
}
