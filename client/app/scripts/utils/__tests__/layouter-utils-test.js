import { fromJS } from 'immutable';

import {
  initEdgesFromNodes,
  markBidirectional
} from '../layouter-utils';


describe('LayouterUtils', () => {
  describe('initEdgesFromNodes', () => {
    it('should return map of edges', () => {
      const input = fromJS({
        a: { adjacency: ['b', 'c'] },
        b: { adjacency: ['a', 'b'] },
        c: {}
      });
      expect(initEdgesFromNodes(input).toJS()).toEqual({
        'a-b': { id: 'a-b', source: 'a', target: 'b', value: 1 },
        'a-c': { id: 'a-c', source: 'a', target: 'c', value: 1 },
        'b-a': { id: 'b-a', source: 'b', target: 'a', value: 1 },
        'b-b': { id: 'b-b', source: 'b', target: 'b', value: 1 },
      });
    });
  });
  describe('markBidirectional', () => {
    it('should mark edges as bidirectional', () => {
      const input = fromJS({
        'a-b': { id: 'a-b', source: 'a', target: 'b' },
        'a-c': { id: 'a-c', source: 'a', target: 'c' },
        'b-a': { id: 'b-a', source: 'b', target: 'a' },
        'b-b': { id: 'b-b', source: 'b', target: 'b' },
      });
      expect(markBidirectional(input).toJS()).toEqual({
        'a-b': { id: 'a-b', source: 'a', target: 'b', bidirectional: true },
        'b-a': { id: 'b-a', source: 'b', target: 'a', bidirectional: true },
        'a-c': { id: 'a-c', source: 'a', target: 'c' },
        'b-b': { id: 'b-b', source: 'b', target: 'b' },
      });
    });
  });
});
