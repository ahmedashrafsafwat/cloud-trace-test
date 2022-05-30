import amqp, { Channel } from 'amqplib';
import {
  ExportQueueMessage,
  SignQueueMessage,
  ClosingSignQueueMessage,
  ClosingQueueMessage,
} from '../models';
import constants from '../constants';
import { ExportPrepMessage } from '../consumers/exportPrep';
import { ClosingPrepQueueMessage } from '../consumers/closingPrep';

class Queue {
  static DSFINVK_V0_EXPORT_PREP_QUEUE = 'dsfinvk_export_prep_queue_v0';
  static DSFINVK_V0_CLOSING_PREP_QUEUE = 'dsfinvk_closing_prep_queue_v0';
  static DSFINVK_EXPORT_QUEUE = 'dsfinvk_export_queue';
  static DSFINVK_EXPORT_TEST_QUEUE = 'dsfinvk_export_test_queue';
  static SIGN_V1_QUEUE = 'sign_queue';
  static SIGN_V2_QUEUE = 'sign_queue_sign_v2';
  static SIGN_V1_CLOSING_QUEUE = 'closing_sign_queue';
  static SIGN_V2_CLOSING_QUEUE = 'closing_sign_queue_sign_v2';
  static CLOSING_QUEUE = 'closing_queue';

  private static instance: Queue;

  private static channel: Channel;

  private static connection: amqp.Connection;

  private constructor() {
    //do nothing
  }

  static async init(prefetch = 1): Promise<Queue> {
    if (!Queue.instance) {
      Queue.instance = new Queue();
    }

    const opts = {
      username: constants.RABBIT_USER,
      password: constants.RABBIT_PASSWORD,
    };

    Queue.connection = await amqp.connect(
      `amqp://${constants.RABBIT_USER}:${constants.RABBIT_PASSWORD}@${constants.RABBIT_HOST}:${constants.RABBIT_PORT}`,
      opts,
    );
    Queue.channel = await Queue.connection.createChannel();
    Queue.channel.prefetch(prefetch);

    Queue.channel.on('close', () => {
      console.log('RabbitMQ Connection closed');
    });
    Queue.channel.on('error', (error) => {
      console.log('RabbitMQ error: ' + JSON.stringify(error));
    });
    Queue.channel.on('return', (msg) => {
      console.log('RabbitMQ returned message:  ' + JSON.stringify(msg));
    });
    Queue.channel.on('drain', () => {
      console.log('RabbitMQ Connection drained');
    });

    return Queue;
  }

  static async getChannel(prefetch?: number): Promise<Channel> {
    if (!Queue.channel) {
      await this.init(prefetch);
    }
    return Queue.channel;
  }

  static async publish(
    queue: string,
    message:
      | ExportQueueMessage
      | SignQueueMessage
      | ClosingSignQueueMessage
      | ClosingQueueMessage
      | ExportPrepMessage
      | ClosingPrepQueueMessage,
  ): Promise<Channel> {
    if (!Queue.channel) {
      await this.init();
    }

    await Queue.channel.assertQueue(queue, {
      durable: true,
    });

    Queue.channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)), {
      persistent: true,
    });

    return this.channel;
  }
  static async close(): Promise<void> {
    if (Queue.connection) {
      return Queue.connection.close();
    }
  }
}

export default Queue;
