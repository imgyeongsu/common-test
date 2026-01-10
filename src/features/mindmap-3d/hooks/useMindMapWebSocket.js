/**
 * WebSocket 연결 및 메시지 처리 훅
 *
 * Phase 1: KEYWORDS 메시지 수신
 * Phase 2: RELATIONSHIPS 메시지 수신
 */

import { useEffect, useRef, useState, useCallback } from 'react';

export function useMindMapWebSocket(url) {
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const handlersRef = useRef({
    onKeywords: null,
    onRelationships: null
  });

  // 메시지 전송
  const sendMessage = useCallback((type, data) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type, data, timestamp: Date.now() }));
      return true;
    }
    console.warn('[MindMap] WebSocket is not connected');
    return false;
  }, []);

  // 핸들러 등록
  const onKeywords = useCallback((handler) => {
    handlersRef.current.onKeywords = handler;
  }, []);

  const onRelationships = useCallback((handler) => {
    handlersRef.current.onRelationships = handler;
  }, []);

  // WebSocket 연결
  useEffect(() => {
    if (!url) return;

    const connect = () => {
      try {
        const ws = new WebSocket(url);
        wsRef.current = ws;

        ws.onopen = () => {
          console.log('[MindMap] WebSocket connected');
          setIsConnected(true);
          if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
            reconnectTimeoutRef.current = null;
          }
        };

        ws.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);

            // Phase 1: 키워드 수신
            if (message.type === 'KEYWORDS' && handlersRef.current.onKeywords) {
              handlersRef.current.onKeywords(message.data);
            }

            // Phase 2: 관계 분석 수신
            if (message.type === 'RELATIONSHIPS' && handlersRef.current.onRelationships) {
              handlersRef.current.onRelationships(message.data);
            }
          } catch (error) {
            console.error('[MindMap] Failed to parse message:', error);
          }
        };

        ws.onerror = (error) => {
          console.error('[MindMap] WebSocket error:', error);
        };

        ws.onclose = () => {
          console.log('[MindMap] WebSocket disconnected');
          setIsConnected(false);

          // 5초 후 재연결
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log('[MindMap] Reconnecting...');
            connect();
          }, 5000);
        };

      } catch (error) {
        console.error('[MindMap] Failed to create WebSocket:', error);
      }
    };

    connect();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [url]);

  return {
    isConnected,
    sendMessage,
    onKeywords,
    onRelationships
  };
}
