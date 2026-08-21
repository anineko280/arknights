import { describe, it, expect, beforeEach } from 'vitest';
import { StoryGraphEngine } from '../../src/core/graph/graph-engine.js';
import { FULL_STORY_DATASET } from '../../src/core/data/dataset.js';

describe('StoryGraphEngine (US-1 / P1 MVP)', () => {
  let engine: StoryGraphEngine;

  beforeEach(() => {
    engine = new StoryGraphEngine(FULL_STORY_DATASET);
  });

  it('should find node by ID', () => {
    const node = engine.getNodeById('main-00-awakening');
    expect(node).toBeDefined();
    expect(node?.title).toContain('暗雲・黎明');
  });

  it('should return prerequisites for a node correctly', () => {
    const prereqs = engine.getPrerequisites('main-01-evil-time');
    expect(prereqs.map(p => p.id)).toContain('main-00-awakening');
  });

  it('should return successors for a node correctly', () => {
    const successors = engine.getSuccessors('main-00-awakening');
    expect(successors.map(s => s.id)).toContain('main-01-evil-time');
  });

  it('should recommend root nodes when progress is empty', () => {
    const recommended = engine.getRecommendedNextStories(new Set());
    const recommendedIds = recommended.map(n => n.id);

    // Initial chapters with no prerequisites should be recommended
    expect(recommendedIds).toContain('main-00-awakening');
    expect(recommendedIds).toContain('intermezzi-darknights-memoir');
    expect(recommendedIds).toContain('side-grani-and-knights-treasure');
    // Chapter 1 has prerequisite (Chapter 0), so should NOT be recommended initially
    expect(recommendedIds).not.toContain('main-01-evil-time');
  });

  it('should unlock subsequent chapters once prerequisite is completed', () => {
    const completed = new Set(['main-00-awakening']);
    const recommended = engine.getRecommendedNextStories(completed);
    const recommendedIds = recommended.map(n => n.id);

    expect(recommendedIds).toContain('main-01-evil-time');
    expect(recommendedIds).not.toContain('main-00-awakening'); // Already completed
  });
});
