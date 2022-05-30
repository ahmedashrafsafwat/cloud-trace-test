import { Channel, ConsumeMessage } from 'amqplib';
import { sqlRead } from './db';
import { ExportEntity } from './models/db';
import logger from './lib/logger';
import Queue from './queue/Queue';
import { selectExport, setExportError, updateExportState } from './db/exports';
import {
  assembleExport,
  migrateCashPointClosingsOnFly,
} from './helpers/exportHelper';
import { ExportQueueMessage } from './models';
import { OrganizationId } from './routes/api/models';
import { createDataPoint, initMetrics } from './lib/metrics';
import constants from './constants';
import config from './config';
import Redis from 'ioredis';

const { METRIC_EXPORT_DURATION, METRIC_EXPORT_PROCESS_DURATION } = constants;

enum ExportMessageStatus {
  WAIT,
  ERROR,
}

async function createDataPointsForCompletedExport(exportObj: ExportEntity) {
  const time = exportObj.time_end.getTime();
  const env = exportObj.env;

  await createDataPoint({
    type: METRIC_EXPORT_DURATION,
    time,
    env,
    intValue: Math.round(
      (exportObj.time_end.getTime() - exportObj.time_request.getTime()) / 1000,
    ),
  });
  await createDataPoint({
    type: METRIC_EXPORT_PROCESS_DURATION,
    time,
    env,
    intValue: Math.round(
      (exportObj.time_end.getTime() - exportObj.time_start.getTime()) / 1000,
    ),
  });
}

async function checkIfExportExistsOnBothDbs(
  organizationId: OrganizationId,
  exportId: string,
): Promise<ExportMessageStatus | ExportEntity> {
  const [selectedExport, selectedExportFromRead] = await Promise.all([
    selectExport(organizationId, exportId),
    selectExport(organizationId, exportId, sqlRead),
  ]);

  if (selectedExport == null && selectedExportFromRead == null) {
    return ExportMessageStatus.ERROR;
  }

  if (selectedExport != null && selectedExportFromRead == null) {
    return ExportMessageStatus.WAIT;
  }

  return selectedExportFromRead;
}

async function delayedNack(
  channel: Channel,
  msg: ConsumeMessage,
  delay = 60000,
) {
  return new Promise((resolve) => {
    setTimeout(() => {
      channel.nack(msg);
      resolve(null);
    }, delay);
  });
}

if (require.main === module) {
  // make sure that everything gets logged via our pino logger:
  console.log = console.info = logger.info.bind(logger);
  console.warn = logger.warn.bind(logger);
  console.error = logger.error.bind(logger);
  const queueName =
    process.env.DSFINVK_EXPORT_QUEUE_SWITCH === 'TEST'
      ? Queue.DSFINVK_EXPORT_TEST_QUEUE
      : Queue.DSFINVK_EXPORT_QUEUE;

  Queue.getChannel().then(async (channel) => {
    await initMetrics();
    channel.assertQueue(queueName, {
      durable: true,
    });

    const redis = new Redis({
      host: config.REDIS_HOST,
      port: config.REDIS_PORT || 6379,
      slotsRefreshTimeout: config.REDIS_CONNECTION_TIMEOUT,
      maxRetriesPerRequest: config.REDIS_MAX_RETRIES_PER_REQUEST,
    });

    channel.consume(queueName, async (msg) => {
      let exportId;

      try {
        const content = JSON.parse(
          msg.content.toString(),
        ) as ExportQueueMessage;
        // TODO: Better logging
        // console.log(
        //   'DSFINVK EXPORT CONSUMER: received message: ' +
        //     JSON.stringify(content),
        // );
        if (content.exportId) {
          exportId = content.exportId;
          console.log(`Retrieved export ${exportId} in exportConsumer`);
          const organizationId = content.organization._id;
          if (content.error) {
            // TODO: Better logging
            console.log(
              'DSFINVK EXPORT CONSUMER: received error: ' +
                JSON.stringify(content.error),
            );
            await setExportError(
              exportId,
              content.error.code,
              content.error.message,
              content.error.details,
            );
          } else {
            try {
              const selectedExport = await checkIfExportExistsOnBothDbs(
                organizationId,
                exportId,
              );
              if (selectedExport === ExportMessageStatus.WAIT) {
                await delayedNack(channel, msg, 10000);
                return;
              }

              if (selectedExport === ExportMessageStatus.ERROR) {
                console.error(
                  'DSFINVK EXPORT CONSUMER: Could not retrieve Export for ID ' +
                    exportId,
                );
                return channel.ack(msg);
              }

              // migrate cash point closing if it is lower than
              // the MIGREATE_CPC_THRESHOLD and the MIGRATE_CPC_VERSION_THRESHOLD
              const migrationFinished = await migrateCashPointClosingsOnFly(
                exportId,
                redis,
              );
              if (!migrationFinished) {
                await delayedNack(channel, msg, 10000);
                return;
              }

              // Republish message to test queue if env is TEST and current queue is only for LIVE exports.
              if (
                selectedExport.env === 'TEST' &&
                queueName === Queue.DSFINVK_EXPORT_QUEUE
              ) {
                console.warn(
                  `DSFINVK EXPORT CONSUMER: Republished export ${exportId} to test queue`,
                );
                Queue.publish(Queue.DSFINVK_EXPORT_TEST_QUEUE, content);
                return channel.ack(msg);
              }

              const { export_state } = selectedExport;
              // An export can already be in state WORKING e.g. due to a deployment. In that case the export should
              // run again.
              if (export_state === 'WORKING') {
                console.info(
                  `Export ${selectedExport.export_id} was already in state WORKING!`,
                );
              }
              if (export_state === 'PENDING' || export_state === 'WORKING') {
                let updatedExport = await updateExportState(
                  exportId,
                  'WORKING',
                  'time_start',
                );
                try {
                  // TODO Perf: Log assemble Export timings
                  await assembleExport(
                    updatedExport,
                    content.organization,
                    content.transactions,
                    content.clients,
                  );

                  updatedExport = await updateExportState(
                    exportId,
                    'COMPLETED',
                    'time_end',
                  );
                  await createDataPointsForCompletedExport(updatedExport);
                } catch (e) {
                  console.error(e);
                  throw new Error('Unknown error');
                }
              } else {
                console.warn(
                  'DSFINVK EXPORT CONSUMER: Export is not in state pending! ' +
                    exportId,
                );
              }
            } catch (error) {
              console.error(
                'DSFINVK EXPORT CONSUMER: Failed to process export: ' +
                  error.message,
              );
              await setExportError(
                exportId,
                error.code || 'E_UNKNOWN',
                error.message || '',
                error,
              );
            }
          }
        } else {
          console.warn(
            'DSFINVK EXPORT CONSUMER: Received message without ExportId! ' +
              msg.content.toString(),
          );
        }
        channel.ack(msg);
      } catch (error) {
        // TODO: Better logging
        // console.error(
        //   'DSFINVK EXPORT CONSUMER: Failed to consume message: ' +
        //     JSON.stringify(msg),
        // );
        console.error(error);
        let requeue = false;
        if (exportId) {
          const code = error.code || 'E_UNKNOWN';
          const message = '';
          const details = JSON.stringify(error);
          try {
            await setExportError(exportId, code, message, details);
            channel.ack(msg);
            return;
          } catch (e) {
            // This looks like a db query failure. Therefore the message should be queued again.
            console.trace(e);
            requeue = true;
          }
        }
        if (requeue) {
          await delayedNack(channel, msg);
        } else {
          channel.ack(msg);
        }
      }
    });
  });
  console.log(`DSFINVK EXPORT CONSUMER: started (${queueName})`);
}
