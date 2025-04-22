package org.ssafy.tmt.api.repository.chat;

import org.springframework.data.jpa.repository.JpaRepository;
import org.ssafy.tmt.api.entity.chat.ChatLog;

import java.util.List;

public interface ChatLogRepository extends JpaRepository<ChatLog, Integer> {

    List<ChatLog> findTop30ByChatRoom_IdOrderByCreatedAtDesc(int roomId);

    ChatLog findTopByChatRoomIdOrderByCreatedAtDesc(int chatRoomId);
}
