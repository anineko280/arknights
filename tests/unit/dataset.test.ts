import { describe, it, expect } from 'vitest';
import { FULL_STORY_DATASET } from '../../src/core/data/dataset.js';

describe('Story Dataset Consistency', () => {
  it('should have valid nodes and edges', () => {
    expect(FULL_STORY_DATASET.nodes.length).toBeGreaterThan(15);
    expect(FULL_STORY_DATASET.edges.length).toBeGreaterThan(10);
  });

  it('should ensure all node IDs are unique', () => {
    const nodeIds = FULL_STORY_DATASET.nodes.map(n => n.id);
    const uniqueIds = new Set(nodeIds);
    expect(uniqueIds.size).toBe(nodeIds.length);
  });

  it('should ensure all edge sources and targets refer to valid existing nodes', () => {
    const nodeIds = new Set(FULL_STORY_DATASET.nodes.map(n => n.id));
    for (const edge of FULL_STORY_DATASET.edges) {
      expect(nodeIds.has(edge.sourceId), `Edge sourceId ${edge.sourceId} does not exist`).toBe(true);
      expect(nodeIds.has(edge.targetId), `Edge targetId ${edge.targetId} does not exist`).toBe(true);
      expect(edge.sourceId).not.toBe(edge.targetId);
    }
  });

  it('should ensure all nodes have required metadata', () => {
    for (const node of FULL_STORY_DATASET.nodes) {
      expect(node.id).toBeTruthy();
      expect(node.title).toBeTruthy();
      expect(node.code).toBeTruthy();
      expect(node.era).toBeTruthy();
      expect(node.chronologicalOrder).toBeGreaterThan(0);
      expect(node.summary).toBeTruthy();
      expect(node.factions.length).toBeGreaterThan(0);
      expect(node.characters.length).toBeGreaterThan(0);
    }
  });
});
