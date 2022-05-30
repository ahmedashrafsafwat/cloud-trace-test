// TODO: Better logging
import logger from './lib/logger';
import Queue from './queue/Queue';
import {
  SignQueueMessage,
  TransactionSecurity,
  TSS,
  ExportQueueMessage,
  ClosingSignQueueMessage,
  ClosingQueueMessage,
} from './models';
import { NIL_UUID } from './routes/api/spec';
import stripIndent from 'strip-indent';
import { v4 as uuid } from 'uuid';

if (require.main === module) {
  // make sure that everything gets logged via our pino logger:
  console.log = console.info = logger.info.bind(logger);
  console.warn = logger.warn.bind(logger);
  console.error = logger.error.bind(logger);

  Queue.getChannel().then((channel) => {
    function signClosingQueue(queueName: string) {
      channel.assertQueue(queueName, {
        durable: true,
      });
      channel.consume(queueName, async (msg) => {
        try {
          const content = JSON.parse(
            msg.content.toString(),
          ) as ClosingSignQueueMessage;
          // TODO: Better logging
          // console.log(
          //   'MOCK CLOSING SIGN CONSUMER: received message: ' +
          //     JSON.stringify(content),
          // );

          // check if triple exists in sign api
          // if not return an error in the queue message, specifying which id is not found
          // txId: tx.transactionId,
          // tssId: tx.tssId,
          // clientId: tx.clientId,

          const message: ClosingQueueMessage = {
            closingId: content.closingId,
            cash_point_closing: content.cash_point_closing,
            organizationId: content.organizationId,
            env: content.env,
            // error: {message: 'error message', details: {detail: 'message'}}
          };

          const { transactions = [] } = content;
          for (const transaction of transactions) {
            let error: any = {
              code: '',
              message: '',
              details: {},
            };

            // Fail if there is an empty transaction
            if (!transaction) {
              message.error = {
                code: 'E_UNKNOWN',
                message: `Unknown error (ref:${uuid()})`,
                details: {},
              };
              break;
            }
            const tx_id = transaction.transactionId;
            // Ignore valid UUID transaction ids
            if (!tx_id.startsWith('00000000')) {
              continue;
            }

            const lastIdPart = tx_id.split('-').reverse()[0];
            const errorType = parseInt(lastIdPart, 10);

            switch (errorType) {
              case 1:
                error = {
                  code: 'E_ORGANIZATION_MISSING',
                  message: 'Organization missing',
                  details: {},
                };
                break;

              case 2:
                error = {
                  code: 'E_TSS_NOT_FOUND',
                  message: 'TSS not found',
                  details: {},
                };
                break;

              case 3:
                error = {
                  code: 'E_CLIENT_NOT_FOUND',
                  message: 'Client not found',
                  details: {},
                };
                break;

              case 4:
                error = {
                  code: 'E_TX_NOT_FOUND',
                  message: 'Transaction not found',
                  details: {},
                };
                break;

              default:
                error.code = 'E_UNKNOWN';
                break;
            }
            message.error = error;
            console.log({ errorType, error });
            break;
          }
          await Queue.publish(Queue.CLOSING_QUEUE, message);
          channel.ack(msg);
        } catch (error) {
          console.error(
            'MOCK CLOSING SIGN CONSUMER: Failed to consume message: ' +
              JSON.stringify(msg),
          );
          channel.nack(msg);
        }
      });
    }
    signClosingQueue(Queue.SIGN_V1_CLOSING_QUEUE);
    console.log('MOCK CLOSING SIGN V1 CONSUMER: started');

    signClosingQueue(Queue.SIGN_V2_CLOSING_QUEUE);
    console.log('MOCK CLOSING SIGN V2 CONSUMER: started');
  });

  Queue.getChannel().then((channel) => {
    function signQueue(queueName: string) {
      channel.assertQueue(queueName, {
        durable: true,
      });

      channel.consume(queueName, async (msg) => {
        try {
          const content = JSON.parse(
            msg.content.toString(),
          ) as SignQueueMessage;
          console.log(
            'MOCK SIGN CONSUMER: received message: ' + JSON.stringify(content),
          );

          const transactionIds = content.transactionIds;
          const transactions: TransactionSecurity[] = [];
          const clientTss = content.clients;
          const TSSs: TSS[] = [];

          for (const { clientId, tssId } of clientTss) {
            const tss: TSS = {
              clientId,
              tssId,
              clientSerialNumber: 'mock-serial-client',
              certificateSerial: 'vQZEPhq7Cla7hVXdea3Zlnijg06gWZyLDec8OCgXtZA=', // todo: fill value from tse
              signatureAlgorithm: 'ecdsa-plain-SHA256', // todo: fill value from tse
              signatureTimestampFormat: 'unixTime',
              transactionDataEncoding: 'UTF-8',
              publicKey:
                '814C5BE8E58F792D94A71FF6C397DDEA68F0210E5E88C812B0A307B55C6243A4F5CE3A590939617045A6B18A601E269B',
              certificate:
                stripIndent(`MIIIRjCCBy6gAwIBAgIQDiOVTgDgOASAvbiZ4/rjkDANBgkqhkiG9w0BAQsFADBw
              MQswCQYDVQQGEwJVUzEVMBMGA1UEChMMRGlnaUNlcnQgSW5jMRkwFwYDVQQLExB3
              d3cuZGlnaWNlcnQuY29tMS8wLQYDVQQDEyZEaWdpQ2VydCBTSEEyIEhpZ2ggQXNz
              dXJhbmNlIFNlcnZlciBDQTAeFw0xOTExMTIwMDAwMDBaFw0yMDEwMDYxMjAwMDBa
              MHkxCzAJBgNVBAYTAlVTMRMwEQYDVQQIEwpDYWxpZm9ybmlhMRYwFAYDVQQHEw1T
              YW4gRnJhbmNpc2NvMSMwIQYDVQQKExpXaWtpbWVkaWEgRm91bmRhdGlvbiwgSW5j
              LjEYMBYGA1UEAwwPKi53aWtpcGVkaWEub3JnMFkwEwYHKoZIzj0CAQYIKoZIzj0D
              AQcDQgAECwWoLfTXwEdZpF/UzGZj3lqeL78GasaurPxR/5ZvoW5rYSndA8S92WRt
              bfklWUvU9ZyRUD4tsXcs+7X7ziz/KKOCBZwwggWYMB8GA1UdIwQYMBaAFFFo/5Cv
              Agd1PMzZZWRiohK4WXI7MB0GA1UdDgQWBBTHr7yYVmImaGgegT3nwXB/U7gwiTCC
              AsUGA1UdEQSCArwwggK4gg8qLndpa2lwZWRpYS5vcmeCDyoud2lraW1lZGlhLm9y
              Z4IUKi53bWZ1c2VyY29udGVudC5vcmeCGSoud2lraW1lZGlhZm91bmRhdGlvbi5v
              cmeCECoud2lrdGlvbmFyeS5vcmeCECoud2lraXZveWFnZS5vcmeCESoud2lraXZl
              cnNpdHkub3JnghAqLndpa2lzb3VyY2Uub3Jngg8qLndpa2lxdW90ZS5vcmeCDiou
              d2lraW5ld3Mub3Jngg4qLndpa2lkYXRhLm9yZ4IPKi53aWtpYm9va3Mub3Jngg13
              aWtpbWVkaWEub3Jngg8qLm1lZGlhd2lraS5vcmeCDXdpa2lwZWRpYS5vcmeCDXdp
              a2lxdW90ZS5vcmeCDW1lZGlhd2lraS5vcmeCEndtZnVzZXJjb250ZW50Lm9yZ4IG
              dy53aWtpghd3aWtpbWVkaWFmb3VuZGF0aW9uLm9yZ4INd2lraWJvb2tzLm9yZ4IO
              d2lrdGlvbmFyeS5vcmeCDndpa2l2b3lhZ2Uub3Jnggx3aWtpZGF0YS5vcmeCD3dp
              a2l2ZXJzaXR5Lm9yZ4IOd2lraXNvdXJjZS5vcmeCDHdpa2luZXdzLm9yZ4IRKi5t
              Lndpa2lwZWRpYS5vcmeCEioubS53aWt0aW9uYXJ5Lm9yZ4ISKi5tLndpa2l2b3lh
              Z2Uub3JnghEqLm0ud2lraXF1b3RlLm9yZ4ITKi5tLndpa2l2ZXJzaXR5Lm9yZ4IS
              Ki5tLndpa2lzb3VyY2Uub3JnghEqLm0ud2lraW1lZGlhLm9yZ4IQKi5tLndpa2lu
              ZXdzLm9yZ4IQKi5tLndpa2lkYXRhLm9yZ4IRKi5tLndpa2lib29rcy5vcmeCFiou
              cGxhbmV0Lndpa2ltZWRpYS5vcmeCESoubS5tZWRpYXdpa2kub3JnMA4GA1UdDwEB
              /wQEAwIHgDAdBgNVHSUEFjAUBggrBgEFBQcDAQYIKwYBBQUHAwIwdQYDVR0fBG4w
              bDA0oDKgMIYuaHR0cDovL2NybDMuZGlnaWNlcnQuY29tL3NoYTItaGEtc2VydmVy
              LWc2LmNybDA0oDKgMIYuaHR0cDovL2NybDQuZGlnaWNlcnQuY29tL3NoYTItaGEt
              c2VydmVyLWc2LmNybDBMBgNVHSAERTBDMDcGCWCGSAGG/WwBATAqMCgGCCsGAQUF
              BwIBFhxodHRwczovL3d3dy5kaWdpY2VydC5jb20vQ1BTMAgGBmeBDAECAjCBgwYI
              KwYBBQUHAQEEdzB1MCQGCCsGAQUFBzABhhhodHRwOi8vb2NzcC5kaWdpY2VydC5j
              b20wTQYIKwYBBQUHMAKGQWh0dHA6Ly9jYWNlcnRzLmRpZ2ljZXJ0LmNvbS9EaWdp
              Q2VydFNIQTJIaWdoQXNzdXJhbmNlU2VydmVyQ0EuY3J0MAwGA1UdEwEB/wQCMAAw
              ggEDBgorBgEEAdZ5AgQCBIH0BIHxAO8AdgCkuQmQtBhYFIe7E6LMZ3AKPDWYBPkb
              37jjd80OyA3cEAAAAW5gyWh8AAAEAwBHMEUCIQCDMvfnV2lWsrcvMAi8RJt7qM6F
              tqp/DPoUGK3DNRVaDgIgKhct/NgNygQT6ZXGnYEa/HsUkGOpMbTaWJv2w4qUAcYA
              dQBep3P531bA57U2SH3QSeAyepGaDIShEhKEGHWWgXFFWAAAAW5gyWhrAAAEAwBG
              MEQCIHJ9VdG5lYHXu10JhmJsdseSfiquMkvB9M6WYGA3UDF8AiANs6E2Z/YHAoBb
              SIzTw/9Ta/yer2cNDLDq36pHDtHpPTANBgkqhkiG9w0BAQsFAAOCAQEASk4Sd7nV
              NGpyH1ch9+xaF/DIIccKRPjteWeiAjVN79zeJHkud8pdwlv6e2zgbYK+CeUo3Q3+
              pZvzrJ2faE1Y1gfBjw1rDXxmIefpDC4p5Y5JF3HD0aMusBsSdGMcBptfLAQMcgKY
              /WX870stqzNxwrhzkvedhRjQxIPiIyz1EYAACfYoCUg578oncv4wjNDSwnVlWDkS
              Lym8B23uwNSjMHCcGyQSLEQjrlFdy8CenHw3DMFlgOjiI4t7qC4nznNUn1TspCA9
              DAANdOKs8h6GFXsaUTP7D0Xh6Xe5XIzW9kKt81bDYbMh1bEJ4WAfHeZu7O2XckOD
              0exZoQL5XphNwA==`).replace(/\s/g, ''), // todo: fill value from tse
            };
            TSSs.push(tss);
          }

          let error: any = undefined;
          let logCount = 0;
          for (const txId of transactionIds) {
            if (!txId) {
              const message: ExportQueueMessage = {
                exportId: content.exportId,
                clients: [],
                transactions: [],
                organization: content.organization,
                error: {
                  code: 'E_UNKNOWN',
                  message: `Unknown error (ref:${uuid()})`,
                  details: {},
                },
              };

              await Queue.publish(Queue.DSFINVK_EXPORT_QUEUE, message);
              await channel.ack(msg);
              return;
            }

            logCount++;
            const transaction: TransactionSecurity = {
              txId,
              tssId: TSSs.length ? TSSs[0].tssId : NIL_UUID, // todo: fill value from tse
              clientId: TSSs.length ? TSSs[0].clientId : NIL_UUID, // todo: fill value from tse
              transactionNumber: 0, // todo: fill value from tse
              transactionLogStart: Math.floor(
                (new Date('2020-10-10 12:00:00').getTime() + logCount * 10000) /
                  1000,
              ), // todo: fill value from tse
              transactionLogFinish: Math.floor(
                (new Date('2020-10-10 12:00:00').getTime() + logCount * 10000) /
                  1000,
              ), // todo: fill value from tse
              processType: 'Kassenbeleg-V1', // todo: fill value from tse
              signatureCounter: 0, // todo: fill value from tse
              signature: 'mock-signature', // base64 // todo: fill value from tse
              processData:
                'QmVsZWdeMC4wMF8yLjU1XzAuMDBfMC4wMF8wLjAwXjIuNTU6QmFy', // todo: fill value from tse
            };
            transactions.push(transaction);

            // Simulate an error when txId is not a NIL_UUID
            if (error == null && txId.startsWith('00000000')) {
              const lastIdPart = txId.split('-').reverse()[0];
              const errorType = parseInt(lastIdPart, 10);
              error = {
                code: '',
                message: '',
                details: {},
              };
              switch (errorType) {
                case 1:
                  error = {
                    code: 'E_ORGANIZATION_MISSING',
                    message: 'Organization missing',
                    details: {},
                  };
                  break;

                case 2:
                  error = {
                    code: 'E_TSS_NOT_FOUND',
                    message: 'TSS not found',
                    details: {},
                  };
                  break;

                case 3:
                  error = {
                    code: 'E_CLIENT_NOT_FOUND',
                    message: 'Client not found',
                    details: {},
                  };
                  break;

                case 4:
                  error = {
                    code: 'E_TX_NOT_FOUND',
                    message: 'Transaction not found',
                    details: {},
                  };
                  break;

                default:
                  error.code = 'E_UNKNOWN';
                  break;
              }
            }
          }

          const message: ExportQueueMessage = {
            exportId: content.exportId,
            clients: TSSs,
            transactions,
            organization: content.organization,
            error,
            // error: {message: 'error message', details: {detail: 'message'}}
          };

          await Queue.publish(Queue.DSFINVK_EXPORT_QUEUE, message);
          channel.ack(msg);
        } catch (error) {
          console.error(error);
          channel.ack(msg);
        }
      });
    }
    signQueue(Queue.SIGN_V1_QUEUE);
    console.log('MOCK SIGN V1 CONSUMER: started');

    signQueue(Queue.SIGN_V2_QUEUE);
    console.log('MOCK SIGN V2 CONSUMER: started');
  });
}
