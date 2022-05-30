import { FastifyInstance } from 'fastify';

export default async function (fastify: FastifyInstance) {
  fastify.get('/ready', (_, reply) => {
    // TODO: check if database connection is possible, otherwise return HTTP 500
    reply.type('text/plain').send('OK');
  });
  fastify.get('/live', (_, reply) => {
    // TODO: check if database connection is still alive, otherwise return HTTP 500
    reply.type('text/plain').send('OK');
  });
}
