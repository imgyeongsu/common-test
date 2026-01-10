/**
 * Chat Page - WebRTC 채팅 페이지
 *
 * Features를 조합하여 화면을 구성하는 페이지 레벨 컴포넌트
 */

import { useWebRTCChat, ChatRoom } from '@/features/webrtc-chat';

function ChatPage() {
  const {
    isConnected,
    messages,
    currentUser,
    socketId,
    register,
    sendMessage
  } = useWebRTCChat('main-room');

  return (
    <ChatRoom
      messages={messages}
      isConnected={isConnected}
      currentUser={currentUser}
      socketId={socketId}
      onSendMessage={sendMessage}
      onRegister={register}
    />
  );
}

export default ChatPage;
