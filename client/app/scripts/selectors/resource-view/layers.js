import { times } from 'lodash';
import { fromJS, Map as makeMap } from 'immutable';
import { createSelector } from 'reselect';

import { RESOURCES_LAYER_PADDING, RESOURCES_LAYER_HEIGHT } from '../../constants/styles';
import { resourceViewLayers } from '../../constants/resources';
import {
  nodeColorDecorator,
  nodeParentNodeDecorator,
  nodeResourceBoxDecorator,
} from '../../decorators/node';


const RESOURCE_VIEW_MAX_LAYERS = 3;

const nodeWeight = node => (
  node.get('withCapacity') ? -node.get('consumption') : -node.get('width')
);

export const layersTopologyIdsSelector = createSelector(
  [
    state => state.get('currentTopologyId'),
  ],
  topologyId => fromJS(resourceViewLayers[topologyId] || [])
);

export const layersVerticalPositionSelector = createSelector(
  [
    layersTopologyIdsSelector,
  ],
  (topologiesIds) => {
    let yPositions = makeMap();
    let currentY = RESOURCES_LAYER_PADDING;

    topologiesIds.forEach((topologyId) => {
      currentY -= RESOURCES_LAYER_HEIGHT + RESOURCES_LAYER_PADDING;
      yPositions = yPositions.set(topologyId, currentY);
    });

    return yPositions;
  }
);

const decoratedNodesByTopologySelector = createSelector(
  [
    layersTopologyIdsSelector,
    state => state.get('pinnedMetricType'),
    ...times(RESOURCE_VIEW_MAX_LAYERS, index => (
      state => state.getIn(['nodesByTopology', layersTopologyIdsSelector(state).get(index)])
    ))
  ],
  (layersTopologyIds, pinnedMetricType, ...topologiesNodes) => {
    let nodesByTopology = makeMap();
    let lastLayerTopologyId = null;

    topologiesNodes.forEach((topologyNodes, index) => {
      const layerTopologyId = layersTopologyIds.get(index);
      const decoratedTopologyNodes = (topologyNodes || makeMap())
        .map(node => node.set('directParentTopologyId', lastLayerTopologyId))
        .map(node => node.set('topologyId', layerTopologyId))
        .map(node => node.set('metricType', pinnedMetricType))
        .map(node => node.set('withCapacity', layerTopologyId === 'hosts'))
        .map(nodeResourceBoxDecorator)
        .map(nodeParentNodeDecorator)
        .map(nodeColorDecorator);
      const filteredTopologyNodes = decoratedTopologyNodes
        .map(node => node.set('meta', node))
        .filter(node => node.get('parentNodeId') || index === 0)
        .filter(node => node.get('width'));

      nodesByTopology = nodesByTopology.set(layerTopologyId, filteredTopologyNodes);
      lastLayerTopologyId = layerTopologyId;
    });

    return nodesByTopology;
  }
);

export const positionedNodesByTopologySelector = createSelector(
  [
    layersTopologyIdsSelector,
    decoratedNodesByTopologySelector,
    layersVerticalPositionSelector,
  ],
  (layersTopologyIds, decoratedNodesByTopology, layersVerticalPosition) => {
    let result = makeMap();

    layersTopologyIds.forEach((layerTopologyId, index) => {
      const decoratedNodes = decoratedNodesByTopology.get(layerTopologyId, makeMap());
      const buckets = decoratedNodes.groupBy(node => node.get('parentNodeId'));
      const y = layersVerticalPosition.get(layerTopologyId);

      buckets.forEach((bucket, parentNodeId) => {
        const parentTopologyId = layersTopologyIds.get(index - 1);
        const sortedBucket = bucket.sortBy(nodeWeight);

        let x = result.getIn([parentTopologyId, parentNodeId, 'x'], 0);

        sortedBucket.forEach((node, nodeId) => {
          const positionedNode = node.merge(makeMap({ x, y }));
          result = result.setIn([layerTopologyId, nodeId], positionedNode);
          x += node.get('width');
        });
      });
    });

    return result;
  }
);
