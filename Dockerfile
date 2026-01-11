# Build stage
FROM node:20-alpine AS build

WORKDIR /app

# 의존성 파일 복사 및 설치
COPY package*.json ./
RUN npm ci

# 소스 코드 복사
COPY . .

# 빌드 시 환경변수 주입
ARG VITE_SIGNALING_URL
ARG VITE_WS_URL
ENV VITE_SIGNALING_URL=$VITE_SIGNALING_URL
ENV VITE_WS_URL=$VITE_WS_URL

# 빌드 실행
RUN npm run build

# Production stage
FROM nginx:alpine

# Nginx 설정 파일 복사
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 빌드된 파일을 Nginx 서빙 디렉토리로 복사
COPY --from=build /app/dist /usr/share/nginx/html

# 포트 노출
EXPOSE 80

# Nginx 실행
CMD ["nginx", "-g", "daemon off;"]
