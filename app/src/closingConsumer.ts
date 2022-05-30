// TODO: Better logging
import logger from './lib/logger';
import Queue from './queue/Queue';
import { ClosingQueueMessage } from './models';
import {
  selectCashPointClosing,
  setClosingError,
  setClosingState,
} from './db/closing';
import { insertClosingData } from './helpers/insertClosingHelper';
import constants from './constants';
import {
  getCashPointClosingRequest,
  resetCashPointClosing,
} from './helpers/cashPointClosingRequestStore';
import { createDataPoint, initMetrics } from './lib/metrics';
import { CashPointClosingEntity } from './models/db';
import { ErrorWithErrorCode } from './lib/errors';

const {
  METRIC_CASH_POINT_CLOSING_DURATION,
  METRIC_CASH_POINT_CLOSING_PROCESS_DURATION,
} = constants;

async function createDataPointsForCompletedCashPointClosing(
  cashPointClosingObj: CashPointClosingEntity,
) {
  const time = cashPointClosingObj.time_end.getTime();
  const env = cashPointClosingObj.env;

  await createDataPoint({
    type: METRIC_CASH_POINT_CLOSING_DURATION,
    time,
    env,
    intValue: Math.round(
      (time - cashPointClosingObj.time_creation.getTime()) / 1000,
    ),
  });
  await createDataPoint({
    type: METRIC_CASH_POINT_CLOSING_PROCESS_DURATION,
    time,
    env,
    intValue: Math.round(
      (time - cashPointClosingObj.time_start.getTime()) / 1000,
    ),
  });
}

async function processCashPointClosing(content: ClosingQueueMessage) {
  const { closingId } = content;
  let closing = await selectCashPointClosing(
    content.env,
    content.organizationId,
    closingId,
  );
  if (closing == null) {
    throw new ErrorWithErrorCode(
      constants.E_CASH_POINT_CLOSING_NOT_FOUND,
      'CashPointClosing in given environment not found',
    );
  }

  if (closing.state === 'WORKING') {
    console.warn(
      `DSFINVK CLOSING CONSUMER: CashPointClosing is in state working! 
       removing all the inserted data and inserting them again, for closing id: ` +
        closingId,
    );
    try {
      await resetCashPointClosing(closingId);
    } catch (err) {
      throw new ErrorWithErrorCode('E_UNKNOWN', err.message);
    }
    closing = await selectCashPointClosing(
      content.env,
      content.organizationId,
      closingId,
    );
  }
  if (closing.state !== 'PENDING') {
    console.warn(
      'DSFINVK CLOSING CONSUMER: CashPointClosing is not in state pending! ' +
        closingId,
    );
    return;
  }

  console.log(`DSFINVK CLOSING CONSUMER: setting ${closingId} as WORKING`);
  let updatedCashPointClosing = await setClosingState(
    closingId,
    'WORKING',
    'time_start',
  );
  const cashPointClosingRequest = await getCashPointClosingRequest(closingId);
  const cashPointClosing = cashPointClosingRequest.request_body;
  await insertClosingData(
    {
      token_env: content.env,
      organizationId: content.organizationId,
      cash_statement: cashPointClosing.cash_statement,
      closing_id: closingId,
      client_id: cashPointClosing.client_id,
      transactions: cashPointClosing.transactions,
      sign_api_version: closing.sign_api_version,
    },
    closing,
  );
  updatedCashPointClosing = await setClosingState(
    closingId,
    'COMPLETED',
    'time_end',
  );
  await createDataPointsForCompletedCashPointClosing(updatedCashPointClosing);
}

if (require.main === module) {
  // make sure that everything gets logged via our pino logger:
  console.log = console.info = logger.info.bind(logger);
  console.warn = logger.warn.bind(logger);
  console.error = logger.error.bind(logger);

  Queue.getChannel().then(async (channel) => {
    await initMetrics();
    channel.assertQueue(Queue.CLOSING_QUEUE, {
      durable: true,
    });
    channel.consume(Queue.CLOSING_QUEUE, async (msg) => {
      let closingId: string;
      try {
        const content = JSON.parse(
          msg.content.toString(),
        ) as ClosingQueueMessage;
        if (!content.closingId) {
          console.warn(
            'DSFINVK CLOSING CONSUMER: Received message without ClosingId! ' +
              msg.content.toString(),
          );
          return channel.ack(msg);
        }

        closingId = content.closingId;
        if (content.error) {
          console.log(
            'DSFINVK CLOSING CONSUMER: received error: ' +
              JSON.stringify(content.error),
          );
          await setClosingError(
            closingId,
            content.error.code,
            content.error.message,
            content.error.details,
          );
          return channel.ack(msg);
        }

        try {
          await processCashPointClosing(content);
        } catch (error) {
          const errorPayloadJSON = JSON.stringify(error);
          const errorPayload =
            errorPayloadJSON === '{}'
              ? error.message || error.toString()
              : errorPayloadJSON;
          const errorMessage =
            error.externalMessage ||
            (error.statusCode && error.message) ||
            'Unknown error.';
          console.error(error);
          console.warn(`DSFINVK CLOSING CONSUMER error: ${errorPayload}`);
          await setClosingError(
            closingId,
            error.code || 'E_UNKNOWN',
            errorMessage,
            error,
          );
        }
        channel.ack(msg);
      } catch (error) {
        let requeue = false;
        console.error(error);
        if (closingId) {
          const code = error.code || 'UNKNOWN';
          const message = '';
          const details = JSON.stringify(error);
          try {
            await setClosingError(closingId, code, message, details);
            channel.ack(msg);
            return;
          } catch (e) {
            // This looks like a db query failure. Therefore the message should be queued again.
            console.trace(e);
            requeue = true;
          }
        }

        if (requeue) {
          setTimeout(() => {
            channel.nack(msg);
          }, 60000);
        } else {
          channel.ack(msg);
        }
      }
    });
  });
  console.log('DSFINVK CLOSING CONSUMER: started');
}
