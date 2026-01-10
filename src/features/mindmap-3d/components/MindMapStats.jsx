/**
 * 마인드맵 통계 표시 컴포넌트
 */

function MindMapStats({ stats }) {
  return (
    <div style={{
      position: 'absolute',
      top: 10,
      left: 10,
      background: 'rgba(0, 0, 0, 0.7)',
      color: 'white',
      padding: '10px',
      borderRadius: '5px',
      fontSize: '12px',
      fontFamily: 'monospace'
    }}>
      <div>노드: {stats.totalNodes}</div>
      <div>연결: {stats.totalLinks}</div>
      <div>대기 중: {stats.pendingNodes}</div>
      <div>분석 완료: {stats.analyzedNodes}</div>
    </div>
  );
}

export default MindMapStats;
