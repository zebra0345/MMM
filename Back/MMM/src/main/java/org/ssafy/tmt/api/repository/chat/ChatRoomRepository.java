package org.ssafy.tmt.api.repository.chat;

import org.springframework.data.jpa.repository.JpaRepository;
import org.ssafy.tmt.api.entity.chat.ChatRoom;

import java.util.Optional;

public interface ChatRoomRepository extends JpaRepository<ChatRoom, Integer> {
    Optional<ChatRoom> findById(int id);
}
