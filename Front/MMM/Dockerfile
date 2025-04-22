# 빌드 스테이지
FROM node:18.20 AS build

WORKDIR /app

# 의존성 파일 복사 및 설치
COPY package*.json ./
RUN npm install

# 소스 코드 복사
COPY . .

# 프로덕션 빌드
RUN npm run build

# 프로덕션 스테이지
FROM nginx:alpine

# 빌드된 파일을 Nginx 서빙 디렉토리로 복사
COPY --from=build /app/dist /usr/share/nginx/html

# Nginx 포트 설정
EXPOSE 3000

# Nginx 설정 파일 생성
RUN echo 'server { \
    listen 3000; \
    location / { \
        root /usr/share/nginx/html; \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

# Nginx 실행
CMD ["nginx", "-g", "daemon off;"]