const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);

// CORS 설정
app.use(cors());

// Socket.IO 설정 (CORS 허용)
const io = new Server(server, {
  cors: {
    origin: "*", // 개발 중에는 모든 origin 허용, 배포 시 특정 도메인으로 변경
    methods: ["GET", "POST"]
  }
});

// 연결된 사용자 관리
const users = new Map();
const rooms = new Map();

io.on('connection', (socket) => {
  console.log(`✅ 새로운 연결: ${socket.id}`);

  // 사용자 등록
  socket.on('register', (userData) => {
    users.set(socket.id, { ...userData, socketId: socket.id });
    console.log(`👤 사용자 등록: ${userData.name || socket.id}`);

    // 연결된 모든 사용자에게 사용자 목록 전송
    io.emit('users', Array.from(users.values()));
  });

  // 방 참여
  socket.on('join-room', (roomId) => {
    socket.join(roomId);

    if (!rooms.has(roomId)) {
      rooms.set(roomId, new Set());
    }
    rooms.get(roomId).add(socket.id);

    console.log(`🚪 ${socket.id}가 방 ${roomId}에 참여 (${rooms.get(roomId).size}명)`);

    // 방의 다른 사용자들에게 새 사용자 알림
    socket.to(roomId).emit('user-joined', socket.id);

    // 현재 방의 사용자 목록 전송
    const roomUsers = Array.from(rooms.get(roomId));
    io.to(roomId).emit('room-users', roomUsers);
  });

  // WebRTC Offer 전달
  socket.on('offer', (data) => {
    console.log(`📤 Offer 전달: ${socket.id} → ${data.target}`);
    io.to(data.target).emit('offer', {
      offer: data.offer,
      sender: socket.id
    });
  });

  // WebRTC Answer 전달
  socket.on('answer', (data) => {
    console.log(`📥 Answer 전달: ${socket.id} → ${data.target}`);
    io.to(data.target).emit('answer', {
      answer: data.answer,
      sender: socket.id
    });
  });

  // ICE Candidate 전달
  socket.on('ice-candidate', (data) => {
    console.log(`🧊 ICE Candidate 전달: ${socket.id} → ${data.target}`);
    io.to(data.target).emit('ice-candidate', {
      candidate: data.candidate,
      sender: socket.id
    });
  });

  // 채팅 메시지
  socket.on('chat-message', (data) => {
    console.log(`💬 채팅: ${socket.id} - ${data.message}`);

    if (data.roomId) {
      // 방에 메시지 전송
      io.to(data.roomId).emit('chat-message', {
        message: data.message,
        sender: socket.id,
        senderName: users.get(socket.id)?.name || 'Anonymous',
        timestamp: Date.now()
      });
    } else {
      // 전체 브로드캐스트
      io.emit('chat-message', {
        message: data.message,
        sender: socket.id,
        senderName: users.get(socket.id)?.name || 'Anonymous',
        timestamp: Date.now()
      });
    }
  });

  // 연결 해제
  socket.on('disconnect', () => {
    console.log(`❌ 연결 해제: ${socket.id}`);

    // 사용자 목록에서 제거
    users.delete(socket.id);

    // 모든 방에서 제거
    rooms.forEach((roomUsers, roomId) => {
      if (roomUsers.has(socket.id)) {
        roomUsers.delete(socket.id);

        // 방의 다른 사용자들에게 알림
        socket.to(roomId).emit('user-left', socket.id);

        // 방이 비었으면 삭제
        if (roomUsers.size === 0) {
          rooms.delete(roomId);
        }
      }
    });

    // 업데이트된 사용자 목록 전송
    io.emit('users', Array.from(users.values()));
  });
});

// 헬스체크 엔드포인트
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    users: users.size,
    rooms: rooms.size,
    timestamp: new Date().toISOString()
  });
});

const PORT = process.env.PORT || 8080;

server.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════╗
║  🚀 WebRTC 시그널링 서버 시작됨      ║
║  📡 포트: ${PORT}                     ║
║  🌐 http://localhost:${PORT}         ║
╚═══════════════════════════════════════╝
  `);
});
