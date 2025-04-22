package org.ssafy.tmt.api.dto.chat;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatMessageDto {
//    type: "TALK", // Enum 값은 대문자 문자열로 전송
//    roomId: 1,    // 예시 Room ID
//    sender: "username", // 발신자 이름
//    message: "안녕하세요!" // 보낼 메시지

    public enum MessageType {
        ENTER, TALK, EXIT;
    }
    private MessageType type;
    private int roomId;
    private String sender;
    private String message;
    private int userId;
}
