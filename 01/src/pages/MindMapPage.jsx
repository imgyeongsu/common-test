/**
 * MindMap Page - 실시간 3D 지식 마인드맵
 *
 * features를 조합하여 화면을 구성하는 페이지 레벨 컴포넌트
 * - mindmap-3d: 3D 그래프 시각화
 * - (향후) webrtc-learning: 음성 스트림 연동
 */

import { useEffect, useState } from 'react';
import {
  useMindMapWebSocket,
  useMindMapGraph,
  MindMapCanvas,
  MindMapStats,
  MindMapLegend
} from '@/features/mindmap-3d';

function MindMapPage() {
  // WebSocket 연결 (향후 환경변수로 관리)
  const WS_URL = 'ws://localhost:8080';

  // Hooks 조합
  const { isConnected, onKeywords, onRelationships } = useMindMapWebSocket(WS_URL);
  const { graphData, addKeywords, addRelationships, clearGraph, stats, colors } = useMindMapGraph();

  // 입력 패널 상태
  const [showInputPanel, setShowInputPanel] = useState(false);
  const [keywordInput, setKeywordInput] = useState('');
  const [selectedNodes, setSelectedNodes] = useState([]);
  const [relationshipType, setRelationshipType] = useState('uses');
  const [relationshipLabel, setRelationshipLabel] = useState('');

  // WebSocket 핸들러 등록
  useEffect(() => {
    // Phase 1: 키워드 수신 → 노드 생성
    onKeywords((keywords) => {
      console.log('[Page] Received keywords:', keywords);
      addKeywords(keywords);
    });

    // Phase 2: 관계 분석 수신 → 엣지 연결
    onRelationships((relationships) => {
      console.log('[Page] Received relationships:', relationships);
      addRelationships(relationships);
    });
  }, [onKeywords, onRelationships, addKeywords, addRelationships]);

  // 키워드 추가 핸들러
  const handleAddKeyword = () => {
    if (!keywordInput.trim()) return;

    const keywords = keywordInput.split(',').map(text => ({
      id: `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      text: text.trim(),
      timestamp: Date.now()
    }));

    addKeywords(keywords);
    setKeywordInput('');
  };

  // 관계 추가 핸들러
  const handleAddRelationship = () => {
    if (selectedNodes.length !== 2 || !relationshipLabel.trim()) {
      alert('노드 2개를 선택하고 관계명을 입력하세요');
      return;
    }

    const relationship = [{
      source: selectedNodes[0].id,
      target: selectedNodes[1].id,
      relationship: relationshipLabel.trim(),
      type: relationshipType,
      strength: 1,
      sourceData: { category: 'technology', importance: 1.5 },
      targetData: { category: 'concept', importance: 1.5 }
    }];

    addRelationships(relationship);
    setSelectedNodes([]);
    setRelationshipLabel('');
  };

  // 노드 클릭 핸들러 (관계 추가용)
  const handleNodeClick = (node) => {
    console.log('[Page] Node clicked:', node);

    if (selectedNodes.find(n => n.id === node.id)) {
      // 이미 선택된 노드면 제거
      setSelectedNodes(prev => prev.filter(n => n.id !== node.id));
    } else if (selectedNodes.length < 2) {
      // 2개까지만 선택 가능
      setSelectedNodes(prev => [...prev, node]);
    }
  };

  // 디버깅: graphData 변경 시 콘솔 출력
  useEffect(() => {
    console.log('[Page] Current graphData:', graphData);
  }, [graphData]);

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      {/* 연결 상태 표시 */}
      <div style={{
        position: 'absolute',
        top: 10,
        left: '50%',
        transform: 'translateX(-50%)',
        background: isConnected ? 'rgba(0, 200, 0, 0.8)' : 'rgba(200, 0, 0, 0.8)',
        color: 'white',
        padding: '8px 16px',
        borderRadius: '20px',
        fontSize: '12px',
        fontWeight: 'bold',
        zIndex: 1000
      }}>
        {isConnected ? '🟢 연결됨' : '🔴 연결 안됨'}
      </div>

      {/* 통계 */}
      <MindMapStats stats={stats} />

      {/* 범례 */}
      <MindMapLegend colors={colors} />

      {/* 3D 캔버스 */}
      <MindMapCanvas
        graphData={graphData}
        colors={colors}
        onNodeClick={handleNodeClick}
      />

      {/* 선택된 노드 표시 */}
      {selectedNodes.length > 0 && (
        <div style={{
          position: 'absolute',
          bottom: 180,
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(74, 144, 226, 0.9)',
          color: 'white',
          padding: '10px 16px',
          borderRadius: '8px',
          fontSize: '12px',
          zIndex: 1000
        }}>
          선택된 노드: {selectedNodes.map(n => n.name).join(' → ')}
        </div>
      )}

      {/* 입력 패널 */}
      {showInputPanel && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'rgba(0, 0, 0, 0.95)',
          padding: '24px',
          borderRadius: '12px',
          minWidth: '400px',
          zIndex: 2000,
          border: '2px solid #4A90E2'
        }}>
          <h3 style={{ color: 'white', marginTop: 0, marginBottom: '20px' }}>
            마인드맵 입력
          </h3>

          {/* 키워드 입력 */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ color: 'white', display: 'block', marginBottom: '8px', fontSize: '14px' }}>
              키워드 추가 (쉼표로 구분)
            </label>
            <input
              type="text"
              value={keywordInput}
              onChange={(e) => setKeywordInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddKeyword()}
              placeholder="예: WebRTC, P2P, 실시간통신"
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '4px',
                border: '1px solid #666',
                background: '#222',
                color: 'white',
                fontSize: '14px'
              }}
            />
            <button
              onClick={handleAddKeyword}
              style={{
                marginTop: '8px',
                padding: '8px 16px',
                background: '#4A90E2',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                width: '100%',
                fontWeight: 'bold'
              }}
            >
              키워드 추가
            </button>
          </div>

          {/* 관계 입력 */}
          <div style={{ marginBottom: '20px', borderTop: '1px solid #444', paddingTop: '20px' }}>
            <label style={{ color: 'white', display: 'block', marginBottom: '8px', fontSize: '14px' }}>
              관계 추가 (노드 2개 선택 후)
            </label>
            <div style={{ color: '#aaa', fontSize: '12px', marginBottom: '8px' }}>
              선택됨: {selectedNodes.length}/2
            </div>
            <select
              value={relationshipType}
              onChange={(e) => setRelationshipType(e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '4px',
                border: '1px solid #666',
                background: '#222',
                color: 'white',
                fontSize: '14px',
                marginBottom: '8px'
              }}
            >
              <option value="uses">사용</option>
              <option value="contains">포함</option>
              <option value="related">관련</option>
              <option value="implements">구현</option>
            </select>
            <input
              type="text"
              value={relationshipLabel}
              onChange={(e) => setRelationshipLabel(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddRelationship()}
              placeholder="관계명 (예: 활용한다, 포함한다)"
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '4px',
                border: '1px solid #666',
                background: '#222',
                color: 'white',
                fontSize: '14px'
              }}
            />
            <button
              onClick={handleAddRelationship}
              disabled={selectedNodes.length !== 2}
              style={{
                marginTop: '8px',
                padding: '8px 16px',
                background: selectedNodes.length === 2 ? '#90E24A' : '#555',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: selectedNodes.length === 2 ? 'pointer' : 'not-allowed',
                width: '100%',
                fontWeight: 'bold'
              }}
            >
              관계 추가
            </button>
          </div>

          <button
            onClick={() => setShowInputPanel(false)}
            style={{
              padding: '8px 16px',
              background: '#666',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              width: '100%'
            }}
          >
            닫기
          </button>
        </div>
      )}

      {/* 컨트롤 패널 */}
      <div style={{
        position: 'absolute',
        bottom: 20,
        left: '50%',
        transform: 'translateX(-50%)',
        background: 'rgba(0, 0, 0, 0.8)',
        padding: '12px 20px',
        borderRadius: '8px',
        display: 'flex',
        gap: '12px',
        zIndex: 1000
      }}>
        <button
          onClick={() => setShowInputPanel(true)}
          style={{
            padding: '8px 16px',
            background: '#4A90E2',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 'bold'
          }}
        >
          ✏️ 직접 입력
        </button>
        <button
          onClick={clearGraph}
          style={{
            padding: '8px 16px',
            background: '#E24A90',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 'bold'
          }}
        >
          🗑️ 초기화
        </button>
        <button
          onClick={() => {
            const dummyKeywords = [
              { id: 'node1', text: 'WebRTC', timestamp: Date.now() },
              { id: 'node2', text: 'P2P', timestamp: Date.now() },
              { id: 'node3', text: '실시간 통신', timestamp: Date.now() }
            ];
            addKeywords(dummyKeywords);

            setTimeout(() => {
              const dummyRelationships = [
                {
                  source: 'node1',
                  target: 'node2',
                  relationship: '사용',
                  type: 'uses',
                  strength: 1,
                  sourceData: { category: 'technology', importance: 2 },
                  targetData: { category: 'method', importance: 1.5 }
                },
                {
                  source: 'node1',
                  target: 'node3',
                  relationship: '제공',
                  type: 'contains',
                  strength: 1.5,
                  sourceData: { category: 'technology', importance: 2 },
                  targetData: { category: 'concept', importance: 1.8 }
                }
              ];
              addRelationships(dummyRelationships);
            }, 2000);
          }}
          style={{
            padding: '8px 16px',
            background: '#90E24A',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 'bold'
          }}
        >
          🧪 테스트
        </button>
      </div>
    </div>
  );
}

export default MindMapPage;
