FROM gradle:8.13-jdk17 AS build
WORKDIR /app
COPY . .
RUN gradle build -x test --no-daemon

FROM openjdk:17-slim
WORKDIR /app

# 시스템 타임존을 Asia/Seoul로 설정
ENV TZ=Asia/Seoul

COPY --from=build /app/build/libs/TMT-0.0.1-SNAPSHOT.jar /app/app.jar
COPY .env /app/.env

EXPOSE 8080
ENTRYPOINT ["java", "-Duser.timezone=Asia/Seoul","-jar", "app.jar"]