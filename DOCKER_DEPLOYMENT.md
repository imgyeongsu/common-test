# Docker를 활용한 EC2 배포 가이드

## 목차
1. [개념 정리](#1-개념-정리)
2. [프로젝트 구조](#2-프로젝트-구조)
3. [환경변수 설정](#3-환경변수-설정)
4. [Docker 빌드 및 실행](#4-docker-빌드-및-실행)
5. [EC2 배포](#5-ec2-배포)
6. [Jenkins CI/CD](#6-jenkins-cicd)

---

## 1. 개념 정리

### Docker + EC2 배포란?

```
[로컬 개발] → [Docker Image 생성] → [EC2로 전달] → [EC2에서 실행]
```

**주요 구성 요소:**
- **Dockerfile**: 애플리케이션 환경을 코드로 정의
- **Docker Image**: Dockerfile로부터 생성된 실행 가능한 패키지
- **Docker Container**: Image를 실행한 인스턴스
- **EC2**: AWS의 가상 서버

### 프론트엔드/백엔드 분리 아키텍처

```
[EC2 - Frontend]              [EC2 - Signaling Server]       [미래: EC2 - Backend]
  ├─ Nginx (React)              ├─ Node.js (Socket.IO)          ├─ API Server
  ├─ Port: 80/443               ├─ Port: 8080                   ├─ Port: 3000
  └─ 탄력IP: 13.x.x.1          └─ 탄력IP: 13.x.x.2            └─ 탄력IP: 13.x.x.3
```

**또는 단일 EC2:**
```
[단일 EC2 - 탄력IP: 13.x.x.1]
  ├─ Frontend Container   (Port 80/443)
  ├─ Signaling Container  (Port 8080)
  └─ Backend Container    (Port 3000) - 미래
```

---

## 2. 프로젝트 구조

### 현재 구조
```
common-test/
├── Dockerfile              # Frontend용 Dockerfile
├── docker-compose.yml      # 통합 관리 설정
├── .env.example            # 환경변수 템플릿
├── .env.development        # 로컬 개발용 환경변수
├── .env.production         # 배포용 환경변수
│
├── src/                    # Frontend 소스
│   ├── pages/
│   │   └── MindMapPage.jsx          # WS_URL 환경변수 사용
│   └── features/
│       └── webrtc-chat/
│           └── hooks/
│               └── useWebRTCChat.js  # SOCKET_URL 환경변수 사용
│
└── signaling-server/       # Backend (Socket.IO)
    ├── Dockerfile          # Signaling Server용 Dockerfile
    ├── server.js
    └── package.json
```

### 확장 가능한 구조 (권장)
```
project-root/
├── frontend/
│   ├── Dockerfile
│   ├── .env.production
│   └── src/
│
├── signaling-server/
│   ├── Dockerfile
│   └── server.js
│
├── backend/               # 미래 추가
│   ├── Dockerfile
│   └── app/
│
└── docker-compose.yml     # 전체 통합
```

---

## 3. 환경변수 설정

### 환경변수가 필요한 이유

**문제:**
- 로컬: `localhost:8080`
- 개발서버: `dev.example.com:8080`
- 프로덕션: `https://signal.example.com`

**해결:**
```javascript
// ❌ 하드코딩
const SOCKET_URL = 'http://localhost:8080';

// ✅ 환경변수 사용
const SOCKET_URL = import.meta.env.VITE_SIGNALING_URL || 'http://localhost:8080';
```

### 파일별 설정

#### .env.example (Git에 커밋)
```env
# Signaling Server URLs
VITE_SIGNALING_URL=http://localhost:8080
VITE_WS_URL=ws://localhost:8080

# Future: Backend API
# VITE_API_URL=http://localhost:3000
```

#### .env.development (로컬 개발)
```env
VITE_SIGNALING_URL=http://localhost:8080
VITE_WS_URL=ws://localhost:8080
```

#### .env.production (EC2 배포)
```env
# 탄력 IP 사용 시
VITE_SIGNALING_URL=https://13.125.x.x:8080
VITE_WS_URL=wss://13.125.x.x:8080

# 또는 도메인 사용 시
VITE_SIGNALING_URL=https://signal.yourdomain.com
VITE_WS_URL=wss://signal.yourdomain.com
```

### .gitignore 설정
```gitignore
.env.development
.env.production
.env.local
```

---

## 4. Docker 빌드 및 실행

### Frontend 빌드

#### 로컬 테스트
```bash
# 개발 환경으로 빌드
docker build -t frontend:dev .

# 실행
docker run -p 3000:80 frontend:dev
```

#### 프로덕션 빌드 (환경변수 주입)
```bash
docker build \
  --build-arg VITE_SIGNALING_URL=https://13.125.x.x:8080 \
  --build-arg VITE_WS_URL=wss://13.125.x.x:8080 \
  -t frontend:prod .

# 실행
docker run -d -p 80:80 --name frontend frontend:prod
```

### Signaling Server 빌드

```bash
cd signaling-server

# 빌드
docker build -t signaling-server:latest .

# 실행
docker run -d -p 8080:8080 --name signaling signaling-server:latest

# 헬스체크
curl http://localhost:8080/health
```

### docker-compose로 통합 실행

```bash
# 개발 환경
docker-compose up

# 프로덕션 환경 (백그라운드)
docker-compose up -d

# 로그 확인
docker-compose logs -f

# 중지
docker-compose down
```

---

## 5. EC2 배포

### 사전 준비

#### 1. EC2 인스턴스 생성
- AMI: Ubuntu 22.04 LTS
- 인스턴스 타입: t2.micro (또는 t3.small)
- 스토리지: 20GB

#### 2. 탄력 IP 할당
```
EC2 > 탄력적 IP > 주소 할당 > 인스턴스에 연결
예: 13.125.x.x
```

#### 3. 보안 그룹 설정
```
인바운드 규칙:
┌──────┬────────────┬───────────┐
│ 포트 │ 프로토콜   │ 소스      │
├──────┼────────────┼───────────┤
│ 22   │ SSH        │ 내 IP만   │
│ 80   │ HTTP       │ 0.0.0.0/0 │
│ 443  │ HTTPS      │ 0.0.0.0/0 │
│ 8080 │ Custom TCP │ 0.0.0.0/0 │
└──────┴────────────┴───────────┘
```

### EC2에 Docker 설치

```bash
# EC2 접속
ssh -i your-key.pem ubuntu@13.125.x.x

# Docker 설치
sudo apt update
sudo apt install -y docker.io docker-compose
sudo systemctl start docker
sudo systemctl enable docker

# 현재 사용자를 docker 그룹에 추가
sudo usermod -aG docker $USER
newgrp docker

# 설치 확인
docker --version
docker-compose --version
```

### 배포 방법 1: Docker Hub 사용

#### 로컬에서 빌드 & Push
```bash
# Docker Hub 로그인
docker login

# Frontend 빌드 & Push
docker build \
  --build-arg VITE_SIGNALING_URL=https://13.125.x.x:8080 \
  --build-arg VITE_WS_URL=wss://13.125.x.x:8080 \
  -t yourusername/frontend:latest .
docker push yourusername/frontend:latest

# Signaling Server 빌드 & Push
cd signaling-server
docker build -t yourusername/signaling-server:latest .
docker push yourusername/signaling-server:latest
```

#### EC2에서 Pull & Run
```bash
# Pull
docker pull yourusername/frontend:latest
docker pull yourusername/signaling-server:latest

# Run
docker run -d -p 80:80 --name frontend yourusername/frontend:latest
docker run -d -p 8080:8080 --name signaling yourusername/signaling-server:latest

# 확인
docker ps
curl http://localhost/
curl http://localhost:8080/health
```

### 배포 방법 2: Git Clone & Build

```bash
# EC2에서
git clone https://github.com/yourusername/your-repo.git
cd your-repo/common-test

# .env.production 파일 생성
cat > .env.production << EOF
VITE_SIGNALING_URL=https://13.125.x.x:8080
VITE_WS_URL=wss://13.125.x.x:8080
EOF

# docker-compose로 실행
docker-compose up -d

# 로그 확인
docker-compose logs -f
```

### 배포 방법 3: AWS ECR 사용

```bash
# ECR 로그인
aws ecr get-login-password --region ap-northeast-2 | \
  docker login --username AWS --password-stdin xxxxx.dkr.ecr.ap-northeast-2.amazonaws.com

# 빌드 & Push
docker build -t frontend:latest .
docker tag frontend:latest xxxxx.dkr.ecr.ap-northeast-2.amazonaws.com/frontend:latest
docker push xxxxx.dkr.ecr.ap-northeast-2.amazonaws.com/frontend:latest

# EC2에서 Pull & Run
docker pull xxxxx.dkr.ecr.ap-northeast-2.amazonaws.com/frontend:latest
docker run -d -p 80:80 xxxxx.dkr.ecr.ap-northeast-2.amazonaws.com/frontend:latest
```

---

## 6. Jenkins CI/CD

### Jenkins 설치 (별도 EC2 또는 로컬)

#### Docker로 Jenkins 실행
```bash
docker run -d \
  -p 8080:8080 -p 50000:50000 \
  -v jenkins_home:/var/jenkins_home \
  -v /var/run/docker.sock:/var/run/docker.sock \
  --name jenkins \
  jenkins/jenkins:lts
```

#### 초기 비밀번호 확인
```bash
docker logs jenkins
# 또는
docker exec jenkins cat /var/jenkins_home/secrets/initialAdminPassword
```

### Jenkins 파이프라인 설정

#### 1. GitHub Webhook 설정
```
GitHub Repository > Settings > Webhooks > Add webhook
Payload URL: http://jenkins-server:8080/github-webhook/
Content type: application/json
Events: Just the push event
```

#### 2. Jenkins Job 생성
```
New Item > Pipeline > OK
Build Triggers: GitHub hook trigger for GITScm polling ✓
Pipeline: Pipeline script from SCM
  SCM: Git
  Repository URL: https://github.com/username/repo.git
  Branch: */main
  Script Path: Jenkinsfile
```

#### 3. Jenkinsfile 작성

**프로젝트 루트에 Jenkinsfile 생성:**

```groovy
pipeline {
    agent any

    environment {
        DOCKER_HUB_CREDENTIALS = credentials('dockerhub-credentials')
        EC2_HOST = '13.125.x.x'
        EC2_USER = 'ubuntu'
        SIGNALING_URL = 'https://13.125.x.x:8080'
        WS_URL = 'wss://13.125.x.x:8080'
    }

    stages {
        stage('Checkout') {
            steps {
                git branch: 'main', url: 'https://github.com/username/repo.git'
            }
        }

        stage('Build Frontend') {
            steps {
                dir('common-test') {
                    sh """
                        docker build \
                          --build-arg VITE_SIGNALING_URL=${SIGNALING_URL} \
                          --build-arg VITE_WS_URL=${WS_URL} \
                          -t ${DOCKER_HUB_CREDENTIALS_USR}/frontend:${BUILD_NUMBER} \
                          -t ${DOCKER_HUB_CREDENTIALS_USR}/frontend:latest .
                    """
                }
            }
        }

        stage('Build Signaling Server') {
            steps {
                dir('common-test/signaling-server') {
                    sh """
                        docker build \
                          -t ${DOCKER_HUB_CREDENTIALS_USR}/signaling-server:${BUILD_NUMBER} \
                          -t ${DOCKER_HUB_CREDENTIALS_USR}/signaling-server:latest .
                    """
                }
            }
        }

        stage('Push to Docker Hub') {
            steps {
                sh """
                    echo ${DOCKER_HUB_CREDENTIALS_PSW} | docker login -u ${DOCKER_HUB_CREDENTIALS_USR} --password-stdin
                    docker push ${DOCKER_HUB_CREDENTIALS_USR}/frontend:${BUILD_NUMBER}
                    docker push ${DOCKER_HUB_CREDENTIALS_USR}/frontend:latest
                    docker push ${DOCKER_HUB_CREDENTIALS_USR}/signaling-server:${BUILD_NUMBER}
                    docker push ${DOCKER_HUB_CREDENTIALS_USR}/signaling-server:latest
                """
            }
        }

        stage('Deploy to EC2') {
            steps {
                sshagent(['ec2-ssh-key']) {
                    sh """
                        ssh -o StrictHostKeyChecking=no ${EC2_USER}@${EC2_HOST} '
                            # Pull latest images
                            docker pull ${DOCKER_HUB_CREDENTIALS_USR}/frontend:latest
                            docker pull ${DOCKER_HUB_CREDENTIALS_USR}/signaling-server:latest

                            # Stop and remove old containers
                            docker stop frontend signaling || true
                            docker rm frontend signaling || true

                            # Run new containers
                            docker run -d --name frontend -p 80:80 --restart unless-stopped \
                              ${DOCKER_HUB_CREDENTIALS_USR}/frontend:latest

                            docker run -d --name signaling -p 8080:8080 --restart unless-stopped \
                              ${DOCKER_HUB_CREDENTIALS_USR}/signaling-server:latest

                            # Health check
                            sleep 5
                            curl -f http://localhost/ || exit 1
                            curl -f http://localhost:8080/health || exit 1
                        '
                    """
                }
            }
        }
    }

    post {
        success {
            echo "✅ 배포 성공! Build #${BUILD_NUMBER}"
            // Slack 알림 등 추가 가능
        }
        failure {
            echo "❌ 배포 실패! Build #${BUILD_NUMBER}"
        }
        always {
            sh 'docker logout'
        }
    }
}
```

#### 4. Jenkins Credentials 설정

**Docker Hub Credentials:**
```
Jenkins > Manage Jenkins > Credentials > Add Credentials
Kind: Username with password
Username: dockerhub-username
Password: dockerhub-password
ID: dockerhub-credentials
```

**EC2 SSH Key:**
```
Jenkins > Manage Jenkins > Credentials > Add Credentials
Kind: SSH Username with private key
Username: ubuntu
Private Key: [your-ec2-key.pem 내용 붙여넣기]
ID: ec2-ssh-key
```

### CI/CD 워크플로우

```
[개발자] git push
   ↓
[GitHub] Webhook 전송
   ↓
[Jenkins] 자동 빌드 트리거
   ↓
[Jenkins]
  1. Git Clone
  2. Frontend Docker Build (환경변수 주입)
  3. Signaling Server Docker Build
  4. Docker Hub에 Push
  5. EC2 SSH 접속
  6. EC2에서 Pull & 재시작
  7. Health Check
   ↓
[배포 완료] ✅
```

---

## 7. 유용한 명령어

### Docker 관리

```bash
# 실행 중인 컨테이너 확인
docker ps

# 모든 컨테이너 확인 (중지된 것 포함)
docker ps -a

# 로그 확인
docker logs -f frontend
docker logs -f signaling

# 컨테이너 내부 접속
docker exec -it frontend sh
docker exec -it signaling sh

# 컨테이너 중지/시작/재시작
docker stop frontend
docker start frontend
docker restart frontend

# 컨테이너 삭제
docker rm -f frontend

# 이미지 삭제
docker rmi frontend:latest

# 사용하지 않는 리소스 정리
docker system prune -a
```

### docker-compose 관리

```bash
# 시작 (백그라운드)
docker-compose up -d

# 중지
docker-compose down

# 재시작
docker-compose restart

# 로그 확인
docker-compose logs -f

# 특정 서비스만 재시작
docker-compose restart frontend

# 빌드 후 시작
docker-compose up --build -d
```

### 트러블슈팅

```bash
# 네트워크 확인
docker network ls
docker network inspect bridge

# 포트 확인
sudo netstat -tulpn | grep :80
sudo netstat -tulpn | grep :8080

# 디스크 사용량 확인
docker system df

# EC2 방화벽 확인 (Ubuntu)
sudo ufw status

# Nginx 로그 (컨테이너 내부)
docker exec frontend cat /var/log/nginx/access.log
docker exec frontend cat /var/log/nginx/error.log
```

---

## 8. 보안 고려사항

### 1. 환경변수 관리
```bash
# ❌ Git에 커밋하지 말 것
.env.production

# ✅ .gitignore에 추가
echo ".env.production" >> .gitignore
```

### 2. HTTPS 설정 (Let's Encrypt)

```bash
# EC2에서 Certbot 설치
sudo apt install certbot python3-certbot-nginx

# SSL 인증서 발급
sudo certbot --nginx -d yourdomain.com
```

### 3. Docker 보안

```dockerfile
# Non-root 사용자로 실행
FROM node:20-alpine
RUN addgroup -g 1001 appgroup && adduser -D -u 1001 -G appgroup appuser
USER appuser
```

### 4. 시크릿 관리

Docker Secrets 또는 AWS Secrets Manager 사용

---

## 9. 모니터링

### Docker Stats

```bash
# 리소스 사용량 모니터링
docker stats
```

### Health Check

```bash
# Frontend
curl http://your-ec2-ip/

# Signaling Server
curl http://your-ec2-ip:8080/health
```

### 로그 모니터링

```bash
# 실시간 로그
docker-compose logs -f --tail=100
```

---

## 10. 참고 자료

- [Docker 공식 문서](https://docs.docker.com/)
- [Vite 환경변수](https://vitejs.dev/guide/env-and-mode.html)
- [Jenkins Pipeline](https://www.jenkins.io/doc/book/pipeline/)
- [AWS EC2](https://docs.aws.amazon.com/ec2/)
- [Nginx 설정](https://nginx.org/en/docs/)

---

## 문제 발생 시 체크리스트

- [ ] EC2 보안 그룹에서 포트가 열려있는가?
- [ ] 탄력 IP가 올바르게 할당되었는가?
- [ ] 환경변수가 올바르게 설정되었는가?
- [ ] Docker 컨테이너가 실행 중인가? (`docker ps`)
- [ ] 로그에 에러가 있는가? (`docker logs`)
- [ ] CORS 설정이 올바른가?
- [ ] WebSocket 연결이 성공하는가?
- [ ] HTTPS를 사용한다면 wss:// 프로토콜을 사용하는가?
