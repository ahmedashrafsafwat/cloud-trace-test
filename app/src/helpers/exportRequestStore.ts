import { getKnex } from '../db';
import { ExportQueueMessage } from '../models';

export default async function insertExportRequest(
  exportId: string,
  organizationId: string,
  env: string,
  signQueueMessage?: {
    queueName: string;
    message: ExportQueueMessage;
  },
) {
  const knex = getKnex();
  await knex('export_requests').insert({
    export_id: exportId,
    organization_id: organizationId,
    request_body: '', // legacy
    time_creation: new Date(),
    env,
    sign_queue_message: JSON.stringify(signQueueMessage),
  });
}
