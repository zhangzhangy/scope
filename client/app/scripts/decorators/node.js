import { Map as makeMap } from 'immutable';

import { getNodeColor } from '../utils/color-utils';
import { getMetricValue } from '../utils/metric-utils';
import { RESOURCES_LAYER_HEIGHT } from '../constants/styles';


export function nodeColorDecorator(node) {
  return node.set('color', getNodeColor(node.get('rank'), node.get('label'), node.get('pseudo')));
}

export function nodeResourceBoxDecorator(node) {
  const metricType = node.get('metricType');
  const metric = node.get('metrics', makeMap()).find(m => m.get('label') === metricType);
  if (!metric) return node;

  const { formattedValue } = getMetricValue(metric);
  const info = `Resource usage: ${formattedValue}`;
  const withCapacity = node.get('withCapacity');
  const totalCapacity = metric.get('max') / 1e5;
  const absoluteConsumption = metric.get('value') / 1e5;
  const relativeConsumption = absoluteConsumption / totalCapacity;
  const consumption = withCapacity ? relativeConsumption : 1;
  const width = withCapacity ? totalCapacity : absoluteConsumption;
  const height = RESOURCES_LAYER_HEIGHT;

  return node.merge(makeMap({ width, height, consumption, withCapacity, info }));
}

export function nodeParentNodeDecorator(node) {
  const parentTopologyId = node.get('directParentTopologyId');
  const parents = node.get('parents', makeMap());
  const parent = parents.find(p => p.get('topologyId') === parentTopologyId);
  if (!parent) return node;

  return node.set('parentNodeId', parent.get('id'));
}
