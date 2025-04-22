FROM python:3.11.9-slim

WORKDIR /app

# git 설치
RUN apt-get update && \
    apt-get install -y \
    git \
    python3-tk \
    tk-dev \
    libx11-6 \
    && apt-get clean

# 필요한 패키지 설치
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# .env 파일 복사
COPY .env /app/.env

# 애플리케이션 코드 복사
COPY main.py .
COPY data ./data
COPY model ./model

# 포트 노출
EXPOSE 8100

# 애플리케이션 실행
CMD ["python", "main.py"]