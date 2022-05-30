import { FastifyInstance } from 'fastify';
import upsertRoute from './upsert';
import listRoute from './list';
import getRoute from './retrieveOne';
import retrieveCashRegisterMetadata from './retrieveCashRegisterMetadata';
import upsertCashRegisterMetadata from './upsertCashRegisterMetadata';

const cashRegisterRoutes = async (fastify: FastifyInstance) => {
  fastify.register(listRoute);
  fastify.register(getRoute);
  fastify.register(upsertRoute);
  fastify.register(upsertCashRegisterMetadata);
  fastify.register(retrieveCashRegisterMetadata);
};

export default cashRegisterRoutes;
