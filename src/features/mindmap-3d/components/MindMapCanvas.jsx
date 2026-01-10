/**
 * 3D 그래프 캔버스 컴포넌트
 *
 * ForceGraph3D를 래핑하여 마인드맵 시각화 제공
 */

import { useRef, useCallback, useEffect } from 'react';
import ForceGraph3D from 'react-force-graph-3d'; // 3D로 복구

function MindMapCanvas({ graphData, colors, onNodeClick, onNodeHover }) {
  const graphRef = useRef();

  // 디버깅: 컴포넌트 마운트 및 데이터 변경 확인
  useEffect(() => {
    console.log('[MindMapCanvas] Component mounted');
    console.log('[MindMapCanvas] graphData:', graphData);
  }, []);

  useEffect(() => {
    console.log('[MindMapCanvas] graphData updated:', graphData);
    if (graphRef.current) {
      // 강제 리프레시
      graphRef.current.refresh();
    }
  }, [graphData]);

  const handleNodeClickInternal = useCallback((node) => {
    if (onNodeClick) {
      onNodeClick(node);
    }
    console.log('[MindMap] Clicked node:', node.name);
  }, [onNodeClick]);

  const handleNodeHoverInternal = useCallback((node) => {
    if (onNodeHover) {
      onNodeHover(node);
    }
  }, [onNodeHover]);

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <ForceGraph3D
        ref={graphRef}
        graphData={graphData}
        width={window.innerWidth}
        height={window.innerHeight}
        nodeLabel="name"
        nodeVal={node => node.val || 1}
        nodeColor={node => node.color || colors.CATEGORY_COLORS.default}
        nodeRelSize={8}
        nodeResolution={16}
        linkLabel="label"
        linkColor={link => link.color || colors.RELATIONSHIP_COLORS.default}
        linkWidth={link => link.strength || 1}
        linkDirectionalParticles={2}
        linkDirectionalParticleWidth={2}
        linkDirectionalParticleSpeed={0.005}
        onNodeClick={handleNodeClickInternal}
        onNodeHover={handleNodeHoverInternal}
        backgroundColor="#000011"
        showNavInfo={false}
        enableNodeDrag={true}
        enableNavigationControls={true}
        d3AlphaDecay={0.02}
        d3VelocityDecay={0.3}
        warmupTicks={100}
        cooldownTicks={0}
      />
    </div>
  );
}

export default MindMapCanvas;
