package org.ssafy.tmt.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketStompBrokerConfig implements WebSocketMessageBrokerConfigurer {

    // 메시지 브로커 옵션을 구성
    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        config.enableSimpleBroker("/sub");
        config.setApplicationDestinationPrefixes("/pub");
    }

    // 각각 특정 URL에 매핑되는 STOMP 엔트포인트를 등록하고, 선택적으로 SockJs 폴백 옵션을 활성화하고 구성합니다.
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        /*
         * addEndpoint : 클라이언트가 WebSocket에 연결하기 위한 엔드포인트를 "/ws-stomp"로 설정합니다.
         * withSockJS : WebSocket을 지원하지 않는 브라우저에서도 SockJS를 통해 WebSocket 기능을 사용할 수 있게 합니다.
         */
        registry
                // 클라이언트가 WebSocket에 연결하기 위한 엔드포인트를 "/ws-stomp"로 설정합니다.
                .addEndpoint("/ws-stomp")
                // 클라이언트의 origin을 명시적으로 지정
                .setAllowedOrigins("http://localhost:3000", "http://localhost:5173", "http://localhost:5174"
                        ,"https://j12c207.p.ssafy.io", "http://j12c207.p.ssafy.io")
                // WebSocket을 지원하지 않는 브라우저에서도 SockJS를 통해 WebSocket 기능을 사용할 수 있게 합니다.
                .withSockJS();
    }
}
