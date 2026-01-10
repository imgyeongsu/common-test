/**
 * 3D 그래프 데이터 관리 훅
 *
 * Phase 1: 키워드를 받아 노드 생성 (희미한 상태)
 * Phase 2: 관계 정보를 받아 엣지 연결 + 노드 활성화
 */

import { useState, useCallback } from 'react';

// 카테고리별 색상 매핑
const CATEGORY_COLORS = {
  technology: '#4A90E2',
  concept: '#E24A90',
  method: '#90E24A',
  tool: '#E2904A',
  pending: '#FFCC00',  // 밝은 노란색 (대기 중 노드)
  default: '#888888'
};

// 관계 타입별 색상
const RELATIONSHIP_COLORS = {
  uses: '#4A90E2',
  contains: '#E24A90',
  related: '#90E24A',
  implements: '#E2904A',
  default: '#666666'
};

export function useMindMapGraph() {
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });

  // Phase 1: 키워드 추가 (희미한 노드 생성)
  const addKeywords = useCallback((keywords) => {
    setGraphData(prev => {
      const existingIds = new Set(prev.nodes.map(n => n.id));
      const newNodes = keywords
        .filter(kw => !existingIds.has(kw.id))
        .map(keyword => ({
          id: keyword.id,
          name: keyword.text,
          val: 3, // 크기 키움 (기본 1 → 3)
          color: CATEGORY_COLORS.pending, // 밝은 노란색
          opacity: 1.0, // 불투명하게 변경 (0.5 → 1.0)
          status: 'pending',
          category: 'pending',
          timestamp: keyword.timestamp || Date.now()
        }));

      if (newNodes.length === 0) return prev;

      console.log(`[MindMap] Added ${newNodes.length} pending nodes`);

      return {
        nodes: [...prev.nodes, ...newNodes],
        links: prev.links
      };
    });
  }, []);

  // Phase 2: 관계 추가 (엣지 연결 + 노드 활성화)
  const addRelationships = useCallback((relationships) => {
    setGraphData(prev => {
      // 노드 업데이트 정보 수집
      const nodeUpdates = new Map();
      relationships.forEach(rel => {
        if (rel.sourceData) {
          nodeUpdates.set(rel.source, {
            category: rel.sourceData.category,
            importance: rel.sourceData.importance || 1,
            color: CATEGORY_COLORS[rel.sourceData.category] || CATEGORY_COLORS.default
          });
        }
        if (rel.targetData) {
          nodeUpdates.set(rel.target, {
            category: rel.targetData.category,
            importance: rel.targetData.importance || 1,
            color: CATEGORY_COLORS[rel.targetData.category] || CATEGORY_COLORS.default
          });
        }
      });

      // 노드 업데이트 (색상, 크기, 불투명도)
      const updatedNodes = prev.nodes.map(node => {
        const update = nodeUpdates.get(node.id);
        if (update) {
          return {
            ...node,
            ...update,
            val: update.importance * 3, // 크기 증가 (2 → 3)
            opacity: 1.0,
            status: 'analyzed'
          };
        }
        return node;
      });

      // 엣지 추가
      const existingLinkKeys = new Set(
        prev.links.map(l => `${l.source}-${l.target}`)
      );
      const newLinks = relationships
        .filter(rel => !existingLinkKeys.has(`${rel.source}-${rel.target}`))
        .map(rel => ({
          source: rel.source,
          target: rel.target,
          label: rel.relationship || '',
          type: rel.type || 'default',
          strength: rel.strength || 1,
          color: RELATIONSHIP_COLORS[rel.type] || RELATIONSHIP_COLORS.default
        }));

      console.log(`[MindMap] Added ${newLinks.length} relationships, updated ${nodeUpdates.size} nodes`);

      return {
        nodes: updatedNodes,
        links: [...prev.links, ...newLinks]
      };
    });
  }, []);

  // 그래프 초기화
  const clearGraph = useCallback(() => {
    setGraphData({ nodes: [], links: [] });
    console.log('[MindMap] Graph cleared');
  }, []);

  // 통계 정보
  const stats = {
    totalNodes: graphData.nodes.length,
    totalLinks: graphData.links.length,
    pendingNodes: graphData.nodes.filter(n => n.status === 'pending').length,
    analyzedNodes: graphData.nodes.filter(n => n.status === 'analyzed').length
  };

  return {
    graphData,
    addKeywords,
    addRelationships,
    clearGraph,
    stats,
    colors: { CATEGORY_COLORS, RELATIONSHIP_COLORS }
  };
}
