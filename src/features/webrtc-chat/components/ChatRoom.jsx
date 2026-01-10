/**
 * ChatRoom Component - 채팅방 UI
 *
 * 순수 UI 컴포넌트 (비즈니스 로직은 Hook에서 관리)
 */

import { useState, useRef, useEffect } from 'react';
import './ChatRoom.css';

export function ChatRoom({
  messages = [],
  isConnected = false,
  currentUser = null,
  socketId = null,
  onSendMessage,
  onRegister
}) {
  const [inputMessage, setInputMessage] = useState('');
  const [username, setUsername] = useState('');
  const [isRegistered, setIsRegistered] = useState(false);
  const messagesEndRef = useRef(null);

  // 자동 스크롤
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 사용자 등록 핸들러
  const handleRegister = (e) => {
    e.preventDefault();
    if (username.trim()) {
      onRegister({ name: username.trim() });
      setIsRegistered(true);
    }
  };

  // 메시지 전송 핸들러
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (inputMessage.trim()) {
      onSendMessage(inputMessage);
      setInputMessage('');
    }
  };

  // 등록 전 화면
  if (!isRegistered) {
    return (
      <div className="chat-register">
        <div className="register-card">
          <h2>채팅방 입장</h2>
          <form onSubmit={handleRegister}>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="닉네임을 입력하세요"
              className="register-input"
              autoFocus
            />
            <button type="submit" className="register-button">
              입장하기
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-room">
      {/* 헤더 */}
      <div className="chat-header">
        <div className="header-info">
          <h2>💬 WebRTC 채팅방</h2>
          <div className="connection-status">
            <span className={`status-dot ${isConnected ? 'connected' : 'disconnected'}`} />
            <span>{isConnected ? '연결됨' : '연결 안됨'}</span>
          </div>
        </div>
        <div className="user-info">
          <span className="user-name">{currentUser?.name || '익명'}</span>
          <span className="user-id">#{socketId?.slice(-4)}</span>
        </div>
      </div>

      {/* 메시지 목록 */}
      <div className="chat-messages">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`message ${msg.type} ${msg.sender === socketId ? 'own' : ''}`}
          >
            {msg.type === 'system' ? (
              <div className="system-message">{msg.message}</div>
            ) : (
              <div className="chat-message">
                <div className="message-header">
                  <span className="sender-name">
                    {msg.sender === socketId ? '나' : msg.senderName}
                  </span>
                  <span className="message-time">
                    {new Date(msg.timestamp).toLocaleTimeString('ko-KR', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
                <div className="message-content">{msg.message}</div>
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* 입력 영역 */}
      <form onSubmit={handleSendMessage} className="chat-input-form">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="메시지를 입력하세요..."
          className="chat-input"
          disabled={!isConnected}
        />
        <button
          type="submit"
          className="send-button"
          disabled={!isConnected || !inputMessage.trim()}
        >
          전송
        </button>
      </form>
    </div>
  );
}
