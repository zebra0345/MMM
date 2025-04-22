package org.ssafy.tmt.config.handler;

import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.util.concurrent.ConcurrentHashMap;

@Component
public class ChatWebSocketHandler extends TextWebSocketHandler {

    // WebSocket Session들을 관리하는 리스트입니다.
    private static final ConcurrentHashMap<String, WebSocketSession> clientSession = new ConcurrentHashMap<>();

    // 성공을 하였을 경우 session 값을 추가합니다.
    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        System.out.println("[+] afterConnectionEstablished :: " + session.getId());
        clientSession.put(session.getId(), session);
    }

    // [메시지 전달] 새로운 WebSocket 메시지가 도착했을 때 호출됩니다.
    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        System.out.println("[+] handleTextMessage :: " + session);
        System.out.println("[+] handleTextMessage :: " + message.getPayload());

        // 같은 아이디가 아니면 메시지를 전달합니다.
        clientSession.forEach((key, value) -> {
            System.out.println("key :: " + key + " value :: " + value);
            if(!key.equals(session.getId())) {
                try {
                    value.sendMessage(message);
                }
                catch (Exception e) {
                    e.printStackTrace();
                }
            }
        });
    }

    // 소켓 종료 세션 제거
    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
        clientSession.remove(session.getId());
        System.out.println("[+] afterConnectionClosed - Session: " + session.getId() + ", CloseStatus: " + status);
    }
}
