package org.ssafy.tmt.api.repository.chat;

import org.springframework.data.jpa.repository.JpaRepository;
import org.ssafy.tmt.api.entity.chat.ChatPeople;

import java.util.List;

public interface ChatPeopleRepository extends JpaRepository<ChatPeople, Integer> {

    List<ChatPeople> findByUsersId(int usersId);
    List<ChatPeople> findByChatRoomId(int chatId);
    int countByChatRoomId(int chatRoomId);

}