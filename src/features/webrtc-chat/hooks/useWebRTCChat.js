/**
 * WebRTC Chat Hook - Socket 연결 및 채팅 로직
 *
 * 비즈니스 로직을 UI와 분리하여 관리
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:8080';

export function useWebRTCChat(roomId = 'default') {
  const [isConnected, setIsConnected] = useState(false);
  const [users, setUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const socketRef = useRef(null);

  useEffect(() => {
    // Socket 연결
    socketRef.current = io(SOCKET_URL, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    });

    const socket = socketRef.current;

    // 연결 이벤트
    socket.on('connect', () => {
      console.log('✅ Socket 연결됨:', socket.id);
      setIsConnected(true);

      // 자동으로 방에 참여
      socket.emit('join-room', roomId);
    });

    socket.on('disconnect', () => {
      console.log('❌ Socket 연결 끊김');
      setIsConnected(false);
    });

    // 사용자 목록 업데이트
    socket.on('users', (userList) => {
      console.log('👥 전체 사용자 목록:', userList);
      setUsers(userList);
    });

    // 방 사용자 목록
    socket.on('room-users', (roomUsers) => {
      console.log('🚪 방 사용자 목록:', roomUsers);
    });

    // 새 사용자 참여
    socket.on('user-joined', (userId) => {
      console.log('👋 새 사용자 참여:', userId);
      setMessages(prev => [...prev, {
        type: 'system',
        message: `${userId}님이 입장했습니다.`,
        timestamp: Date.now()
      }]);
    });

    // 사용자 퇴장
    socket.on('user-left', (userId) => {
      console.log('👋 사용자 퇴장:', userId);
      setMessages(prev => [...prev, {
        type: 'system',
        message: `${userId}님이 퇴장했습니다.`,
        timestamp: Date.now()
      }]);
    });

    // 채팅 메시지 수신
    socket.on('chat-message', (data) => {
      console.log('💬 메시지 수신:', data);
      setMessages(prev => [...prev, {
        type: 'chat',
        ...data
      }]);
    });

    // WebRTC 이벤트 (향후 화상채팅용)
    socket.on('offer', (data) => {
      console.log('📤 Offer 수신:', data);
    });

    socket.on('answer', (data) => {
      console.log('📥 Answer 수신:', data);
    });

    socket.on('ice-candidate', (data) => {
      console.log('🧊 ICE Candidate 수신:', data);
    });

    // 정리
    return () => {
      socket.disconnect();
    };
  }, [roomId]);

  // 사용자 등록
  const register = useCallback((userData) => {
    if (socketRef.current) {
      socketRef.current.emit('register', userData);
      setCurrentUser(userData);
    }
  }, []);

  // 채팅 메시지 전송
  const sendMessage = useCallback((message) => {
    if (socketRef.current && message.trim()) {
      socketRef.current.emit('chat-message', {
        message: message.trim(),
        roomId
      });
    }
  }, [roomId]);

  // 메시지 초기화
  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  return {
    // 상태
    isConnected,
    users,
    messages,
    currentUser,
    socketId: socketRef.current?.id,

    // 액션
    register,
    sendMessage,
    clearMessages
  };
}
