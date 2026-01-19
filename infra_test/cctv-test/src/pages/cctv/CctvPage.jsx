import { useState, useRef, useEffect } from 'react'
import { OpenVidu } from 'openvidu-browser'
import './CctvPage.css'

function CctvPage() {
  const [session, setSession] = useState(null)
  const [publisher, setPublisher] = useState(null)
  const [connected, setConnected] = useState(false)
  const [error, setError] = useState(null)
  const videoRef = useRef(null)
  const OV = useRef(null)

  // 하드코딩된 토큰 (테스트용 - 실제로는 백엔드에서 발급받아야 함)
  const [token, setToken] = useState('')

  const initSession = async () => {
    try {
      setError(null)

      // 1. OpenVidu 객체 생성
      OV.current = new OpenVidu()

      // 2. 세션 초기화
      const newSession = OV.current.initSession()

      // 세션 이벤트 리스너
      newSession.on('exception', (exception) => {
        console.error('Session exception:', exception)
        setError(`세션 예외: ${exception.message}`)
      })

      setSession(newSession)

      // 3. 스트림 생성 (퍼블리셔)
      const newPublisher = await OV.current.initPublisherAsync(undefined, {
        audioSource: true,
        videoSource: true,
        publishAudio: true,
        publishVideo: true,
        resolution: '640x480',
        frameRate: 30,
        mirror: false
      })

      setPublisher(newPublisher)

      // 로컬 비디오 미리보기
      if (videoRef.current) {
        newPublisher.addVideoElement(videoRef.current)
      }

      console.log('세션 및 퍼블리셔 초기화 완료')
    } catch (err) {
      console.error('초기화 오류:', err)
      if (err.name === 'NotAllowedError') {
        setError('카메라/마이크 권한이 거부되었습니다.')
      } else {
        setError(`초기화 실패: ${err.message}`)
      }
    }
  }

  const connectAndPublish = async () => {
    if (!session || !publisher || !token) {
      setError('세션, 퍼블리셔 또는 토큰이 없습니다.')
      return
    }

    try {
      // 4. 세션 접속
      await session.connect(token)
      console.log('세션 연결 성공')

      // 5. 스트림 송출
      await session.publish(publisher)
      console.log('스트림 송출 시작')

      setConnected(true)
    } catch (err) {
      console.error('연결/송출 오류:', err)
      if (err.code === 401) {
        setError('토큰이 만료되었거나 유효하지 않습니다.')
      } else {
        setError(`연결 실패: ${err.message}`)
      }
    }
  }

  const disconnect = () => {
    if (session) {
      session.disconnect()
      setSession(null)
      setPublisher(null)
      setConnected(false)
      console.log('세션 연결 해제')
    }
  }

  useEffect(() => {
    return () => {
      if (session) {
        session.disconnect()
      }
    }
  }, [session])

  return (
    <div className="cctv-page">
      <h1>CCTV 송출 페이지</h1>

      <div className="video-container">
        <video ref={videoRef} autoPlay muted playsInline />
        {!publisher && <div className="placeholder">카메라 미리보기</div>}
      </div>

      <div className="controls">
        <div className="token-input">
          <input
            type="text"
            placeholder="OpenVidu 토큰 입력"
            value={token}
            onChange={(e) => setToken(e.target.value)}
          />
        </div>

        <div className="buttons">
          <button onClick={initSession} disabled={publisher}>
            1. 카메라 시작
          </button>
          <button onClick={connectAndPublish} disabled={!publisher || connected || !token}>
            2. 송출 시작
          </button>
          <button onClick={disconnect} disabled={!connected}>
            송출 중지
          </button>
        </div>
      </div>

      {error && <div className="error">{error}</div>}

      <div className="status">
        <p>상태: {connected ? '송출 중' : publisher ? '대기 중' : '초기화 필요'}</p>
      </div>
    </div>
  )
}

export default CctvPage
