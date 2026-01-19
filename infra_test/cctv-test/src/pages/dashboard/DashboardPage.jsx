import { useState, useRef, useEffect } from 'react'
import { OpenVidu } from 'openvidu-browser'
import SockJS from 'sockjs-client'
import { Stomp } from 'stompjs'
import './DashboardPage.css'

function DashboardPage() {
  const [session, setSession] = useState(null)
  const [subscribers, setSubscribers] = useState([])
  const [wsConnected, setWsConnected] = useState(false)
  const [messages, setMessages] = useState([])
  const [error, setError] = useState(null)
  const [token, setToken] = useState('')
  const [wsUrl, setWsUrl] = useState('http://localhost:8080/ws')

  const OV = useRef(null)
  const stompClient = useRef(null)
  const videoContainerRef = useRef(null)

  // WebSocket 연결
  const connectWebSocket = () => {
    try {
      const socket = new SockJS(wsUrl)
      stompClient.current = Stomp.over(socket)

      // 디버그 로그 비활성화 (원하면 활성화)
      stompClient.current.debug = (msg) => console.log('[STOMP]', msg)

      stompClient.current.connect(
        {},
        (frame) => {
          console.log('Connected:', frame)
          setWsConnected(true)
          addMessage('WebSocket 연결 성공')

          // 채널 구독
          stompClient.current.subscribe('/sub/manager', (message) => {
            console.log('Received:', message)
            const body = JSON.parse(message.body)
            addMessage(`알림: ${JSON.stringify(body)}`)
            window.alert(`새 알림: ${JSON.stringify(body)}`)
          })
        },
        (err) => {
          console.error('STOMP error:', err)
          setError(`WebSocket 연결 실패: ${err}`)
          setWsConnected(false)

          // 재연결 시도
          setTimeout(() => {
            console.log('재연결 시도...')
            connectWebSocket()
          }, 5000)
        }
      )
    } catch (err) {
      console.error('WebSocket 초기화 오류:', err)
      setError(`WebSocket 오류: ${err.message}`)
    }
  }

  const disconnectWebSocket = () => {
    if (stompClient.current) {
      stompClient.current.disconnect()
      setWsConnected(false)
      addMessage('WebSocket 연결 해제')
    }
  }

  // OpenVidu 세션 연결 (영상 수신)
  const connectOpenVidu = async () => {
    if (!token) {
      setError('토큰을 입력해주세요.')
      return
    }

    try {
      setError(null)
      OV.current = new OpenVidu()
      const newSession = OV.current.initSession()

      // 새 스트림 생성 이벤트
      newSession.on('streamCreated', (event) => {
        console.log('새 스트림 감지:', event.stream.streamId)
        const subscriber = newSession.subscribe(event.stream, undefined)

        subscriber.on('videoElementCreated', (e) => {
          console.log('비디오 엘리먼트 생성됨')
          e.element.muted = true // autoplay 정책 대응
          e.element.autoplay = true
          e.element.playsInline = true
          if (videoContainerRef.current) {
            videoContainerRef.current.appendChild(e.element)
          }
        })

        setSubscribers((prev) => [...prev, subscriber])
        addMessage(`새 스트림 연결: ${event.stream.streamId}`)
      })

      // 스트림 종료 이벤트
      newSession.on('streamDestroyed', (event) => {
        console.log('스트림 종료:', event.stream.streamId)
        setSubscribers((prev) =>
          prev.filter((sub) => sub.stream.streamId !== event.stream.streamId)
        )
        addMessage(`스트림 종료: ${event.stream.streamId}`)
      })

      newSession.on('exception', (exception) => {
        console.error('Session exception:', exception)
        setError(`세션 예외: ${exception.message}`)
      })

      await newSession.connect(token)
      setSession(newSession)
      addMessage('OpenVidu 세션 연결 성공')
    } catch (err) {
      console.error('OpenVidu 연결 오류:', err)
      setError(`OpenVidu 연결 실패: ${err.message}`)
    }
  }

  const disconnectOpenVidu = () => {
    if (session) {
      session.disconnect()
      setSession(null)
      setSubscribers([])
      if (videoContainerRef.current) {
        videoContainerRef.current.innerHTML = ''
      }
      addMessage('OpenVidu 세션 연결 해제')
    }
  }

  const addMessage = (msg) => {
    const timestamp = new Date().toLocaleTimeString()
    setMessages((prev) => [...prev, `[${timestamp}] ${msg}`])
  }

  useEffect(() => {
    return () => {
      if (session) session.disconnect()
      if (stompClient.current) stompClient.current.disconnect()
    }
  }, [session])

  return (
    <div className="dashboard-page">
      <h1>관리자 대시보드</h1>

      <div className="dashboard-grid">
        <div className="video-section">
          <h2>영상 모니터링</h2>
          <div
            id="video-container"
            ref={videoContainerRef}
            className="video-container"
          >
            {subscribers.length === 0 && (
              <div className="placeholder">영상 대기 중...</div>
            )}
          </div>

          <div className="openvidu-controls">
            <input
              type="text"
              placeholder="OpenVidu 토큰 입력"
              value={token}
              onChange={(e) => setToken(e.target.value)}
            />
            <div className="buttons">
              <button onClick={connectOpenVidu} disabled={session}>
                영상 연결
              </button>
              <button onClick={disconnectOpenVidu} disabled={!session}>
                연결 해제
              </button>
            </div>
          </div>
        </div>

        <div className="websocket-section">
          <h2>WebSocket 알림</h2>

          <div className="ws-controls">
            <input
              type="text"
              placeholder="WebSocket URL"
              value={wsUrl}
              onChange={(e) => setWsUrl(e.target.value)}
            />
            <div className="buttons">
              <button onClick={connectWebSocket} disabled={wsConnected}>
                WS 연결
              </button>
              <button onClick={disconnectWebSocket} disabled={!wsConnected}>
                WS 해제
              </button>
            </div>
            <div className={`status ${wsConnected ? 'connected' : ''}`}>
              {wsConnected ? '연결됨' : '연결 안됨'}
            </div>
          </div>

          <div className="message-log">
            {messages.map((msg, idx) => (
              <div key={idx} className="message">
                {msg}
              </div>
            ))}
          </div>
        </div>
      </div>

      {error && <div className="error">{error}</div>}
    </div>
  )
}

export default DashboardPage
