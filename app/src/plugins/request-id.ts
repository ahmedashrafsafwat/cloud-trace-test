import fp from 'fastify-plugin';
import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';

async function requestIdPlugin(fastify: FastifyInstance) {
  fastify.addHook(
    'onSend',
    async (request: FastifyRequest, reply: FastifyReply<any>) => {
      const { id } = request;
      if (id != null) {
        reply.header('X-Request-ID', id);
      }
    },
  );
}

export default fp(requestIdPlugin);
