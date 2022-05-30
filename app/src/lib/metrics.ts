/**
 * For a better description on the differences of all the options see
 * https://cloud.google.com/monitoring/api/ref_v3/rest/v3/projects.metricDescriptors
 */
import monitoring, { MetricServiceClient } from '@google-cloud/monitoring';
import config from '../config';
import { Env } from '../routes/api/models';
import constants from '../constants';
import { FastifyRequest } from 'fastify';

const { METRIC_FUNCTION_DURATION } = constants;

const UNINITIALIZED_MONITORING_CLIENT = new Error(
  'Monitoring client was not yet initialized!',
);
const METRIC_PREFIX = 'custom.googleapis.com/';
const isLocal =
  config.METRIC_LOCATION === 'local' &&
  ['development', 'test'].includes(process.env.NODE_ENV);

export enum MetricUnit {
  bit = 'bit',
  byte = 'By',
  seconds = 's',
  second = 's',
  minutes = 'm',
  minute = 'm',
  hours = 'h',
  hour = 'h',
  days = 'd',
  day = 'd',
  dimensionless = '1',
}

export enum MetricKind {
  GAUGE = 'GAUGE',
  DELTA = 'DELTA',
  CUMULATIVE = 'CUMULATIVE',
}

export enum ValueType {
  BOOL = 'BOOL',
  INT64 = 'INT64',
  INT = 'INT64',
  DOUBLE = 'DOUBLE',
  STRING = 'STRING',
  DISTRIBUTION = 'DISTRIBUTION',
}

interface MetricDescriptorLabel {
  key: string;
  valueType: ValueType;
  description?: string;
}

export interface MetricDescriptor {
  /**
   * Metric type to be used. This will automatically be prefixed with `custom.googleapis.com`
   * to mark it as a custom data point.
   */
  type: string;
  /**
   * An optional display name to be used in the Metrics explorer.
   */
  displayName?: string;
  description?: string;
  metricKind: MetricKind;
  valueType: ValueType;
  unit?: MetricUnit;
  labels?: MetricDescriptorLabel[];
}

export interface MetricDataPoint {
  /**
   * Metric type to be used. This will automatically be prefixed with `custom.googleapis.com`
   * to mark it as a custom data point.
   */
  type: string;
  /**
   * The time when this data point happened.
   * This includes milliseconds!
   *
   * @default Date.now()
   */
  time?: number;
  boolValue?: boolean;
  intValue?: number;
  doubleValue?: number;
  stringValue?: string;
  env?: Env;
  labels?: { [key: string]: any };
}

let initialized = false;
let client: MetricServiceClient;

export function logTime(key: string, request?: FastifyRequest) {
  const startDate = new Date();
  const end = async () => {
    const endTime = (Date.now() - startDate.getTime()) / 1000;
    const labels: { [key: string]: any } = {
      key,
    };
    const logMessage = `metric:${key}: ${endTime}`;
    if (request && !process.env.CI) {
      request.log.info(logMessage);
      labels.request_id = (request as any).request_id || undefined;
    } else if (!process.env.CI) {
      console.info(logMessage);
    }
    await createDataPoint({
      type: `${METRIC_FUNCTION_DURATION}`,
      doubleValue: endTime,
      labels,
    });
  };

  return {
    startDate,
    end,
  };
}

export async function createMetricDescriptor(options: MetricDescriptor) {
  if (!client && isLocal) {
    return;
  }

  if (!client) {
    throw UNINITIALIZED_MONITORING_CLIENT;
  }

  const request = {
    name: client.projectPath(config.METRIC_PROJECT_ID),
    metricDescriptor: {
      displayName: options.displayName,
      description: options.description,
      type: METRIC_PREFIX + options.type,
      metricKind: options.metricKind as any,
      valueType: options.valueType as any,
      unit: options.unit,
      labels: options.labels?.map((label: MetricDescriptorLabel) => ({
        key: label.key,
        valueType: label.valueType as any,
        description: label.description,
      })),
    },
  };
  const [descriptor] = await client.createMetricDescriptor(request);
  return descriptor;
}

export async function createDataPoint(dataPoint: MetricDataPoint) {
  if (!client && isLocal) {
    return;
  }

  if (!client) {
    throw UNINITIALIZED_MONITORING_CLIENT;
  }

  // Ignore any data points if the metrics where not yet set up. This usually
  // happens when errors occurred at the initial setup. Going forward here
  // would cause follow-up errors.
  if (!initialized) {
    return;
  }

  const value = {
    boolValue: dataPoint.boolValue,
    int64Value: dataPoint.intValue,
    doubleValue: dataPoint.doubleValue,
    stringValue: dataPoint.stringValue,
  };
  const givenValues = Object.values(value).filter((value) => value != null);
  if (givenValues.length === 0) {
    throw new Error('No values given for data point');
  }
  if (givenValues.length > 1) {
    throw new Error('Multiple value types given for data point');
  }

  const preparedDataPoint = {
    interval: {
      endTime: {
        seconds: (dataPoint.time ? dataPoint.time : Date.now()) / 1000,
      },
    },
    value,
  };

  const request = {
    name: client.projectPath(config.METRIC_PROJECT_ID),
    timeSeries: [
      {
        metric: {
          type: METRIC_PREFIX + dataPoint.type,
          labels: {
            ...(dataPoint.labels || {}),
            env: dataPoint.env,
            location: config.METRIC_LOCATION,
          },
        },
        resource: {
          type: 'global',
          labels: {
            project_id: config.METRIC_PROJECT_ID,
          },
        },
        points: [preparedDataPoint],
      },
    ],
  };

  // Ignore any errors at this point, so the application won't break.
  try {
    const [result] = await client.createTimeSeries(request);
    return result;
  } catch (e) {
    console.error(e);
    return false;
  }
}

export async function initMetrics(metrics: MetricDescriptor[] = []) {
  if (isLocal) {
    return;
  }

  client = new monitoring.MetricServiceClient();

  try {
    for (const metric of metrics) {
      await createMetricDescriptor(metric);
    }
    initialized = true;
  } catch (e) {
    const isDefaultCredentialsError =
      /Could not load the default credentials/.test(e.message);
    if (isDefaultCredentialsError && isLocal) {
      console.warn(
        'Running locally; skipping metrics setup as default credentials were not set.',
      );
      return;
    }

    console.error(e);
  }
}
