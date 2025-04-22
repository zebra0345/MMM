FROM jenkins/jenkins:lts

USER root

# Docker CLI
RUN apt-get update && \
    apt-get -y install apt-transport-https ca-certificates curl gnupg lsb-release && \
    curl -fsSL https://download.docker.com/linux/debian/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg && \
    echo "deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/debian $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null && \
    apt-get update && \
    apt-get -y install docker-ce-cli

# 파이프라인 및 배포에 필요한 도구 설치
RUN apt-get install -y openssh-client

# 기존 docker 그룹이 있다면 삭제 (필요한 경우)
RUN groupdel docker || true

# 호스트와 동일한 GID(999)로 docker 그룹 생성
RUN groupadd -g 999 docker

# Jenkins 사용자(jenkins)를 docker 그룹에 추가
RUN usermod -aG docker jenkins

USER jenkins