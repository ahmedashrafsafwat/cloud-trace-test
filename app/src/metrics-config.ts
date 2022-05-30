// TODO: This could be set up with terraform instead
import {
  MetricDescriptor,
  MetricKind,
  MetricUnit,
  ValueType,
} from './lib/metrics';
import constants from './constants';

const DESCRIPTION_ENV = 'entity environment';
const DESCRIPTION_LOCATION = 'location where the data point was created';

const metrics: MetricDescriptor[] = [
  {
    type: constants.METRIC_EXPORT_DURATION,
    displayName: 'DSFinV-K Export Duration',
    description: 'The overall duration from the request to the finished export',
    metricKind: MetricKind.GAUGE,
    valueType: ValueType.INT,
    unit: MetricUnit.seconds,
    labels: [
      {
        key: 'env',
        valueType: ValueType.STRING,
        description: DESCRIPTION_ENV,
      },
      {
        key: 'location',
        valueType: ValueType.STRING,
        description: DESCRIPTION_LOCATION,
      },
    ],
  },
  {
    type: constants.METRIC_EXPORT_PROCESS_DURATION,
    displayName: 'DSFinV-K Export Process Duration',
    description: 'Duration on how long an export actually took to be processed',
    metricKind: MetricKind.GAUGE,
    valueType: ValueType.INT,
    unit: MetricUnit.seconds,
    labels: [
      {
        key: 'env',
        valueType: ValueType.STRING,
        description: DESCRIPTION_ENV,
      },
      {
        key: 'location',
        valueType: ValueType.STRING,
        description: DESCRIPTION_LOCATION,
      },
    ],
  },

  {
    type: constants.METRIC_CASH_POINT_CLOSING_DURATION,
    displayName: 'DSFinV-K CashPointClosing Duration',
    description:
      'The overall duration from the request to the finished cash_point_closing',
    metricKind: MetricKind.GAUGE,
    valueType: ValueType.INT,
    unit: MetricUnit.seconds,
    labels: [
      {
        key: 'env',
        valueType: ValueType.STRING,
        description: DESCRIPTION_ENV,
      },
      {
        key: 'location',
        valueType: ValueType.STRING,
        description: DESCRIPTION_LOCATION,
      },
    ],
  },
  {
    type: constants.METRIC_CASH_POINT_CLOSING_PROCESS_DURATION,
    displayName: 'DSFinV-K CashPointClosing Process Duration',
    description:
      'Duration on how long a cash_point_closing actually took to be processed',
    metricKind: MetricKind.GAUGE,
    valueType: ValueType.INT,
    unit: MetricUnit.seconds,
    labels: [
      {
        key: 'env',
        valueType: ValueType.STRING,
        description: DESCRIPTION_ENV,
      },
      {
        key: 'location',
        valueType: ValueType.STRING,
        description: DESCRIPTION_LOCATION,
      },
    ],
  },
];

export default metrics;
