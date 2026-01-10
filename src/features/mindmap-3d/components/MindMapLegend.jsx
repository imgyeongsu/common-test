/**
 * 마인드맵 범례 컴포넌트
 */

function MindMapLegend({ colors }) {
  return (
    <div style={{
      position: 'absolute',
      top: 10,
      right: 10,
      background: 'rgba(0, 0, 0, 0.7)',
      color: 'white',
      padding: '10px',
      borderRadius: '5px',
      fontSize: '11px',
      fontFamily: 'monospace'
    }}>
      <div style={{ marginBottom: '8px', fontWeight: 'bold' }}>카테고리</div>
      {Object.entries(colors.CATEGORY_COLORS).map(([key, color]) => (
        key !== 'default' && (
          <div key={key} style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
            <div style={{
              width: '12px',
              height: '12px',
              backgroundColor: color,
              borderRadius: '50%',
              marginRight: '6px'
            }} />
            <span>{key}</span>
          </div>
        )
      ))}
    </div>
  );
}

export default MindMapLegend;
