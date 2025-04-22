package org.ssafy.tmt.api.service.chat;

import org.springframework.http.ResponseEntity;
import org.ssafy.tmt.api.dto.chat.*;
import org.ssafy.tmt.api.request.chat.SearchUserRequest;
import org.ssafy.tmt.config.security.CustomUserDetails;

public interface ChatService {

    ResponseEntity<Object> SearchUser(SearchUserRequest searchUserRequest);
    ResponseEntity<Object> createRoom(ChatRoomDto chatRoomDto);
    ResponseEntity<Object> findRoomById(CustomUserDetails customUserDetails);
    ResponseEntity<Object> sendMessage(ChatMessageDto chatMessageDto);
    ResponseEntity<Object> getChatLog(ChatLogDto chatLogDto);
    ResponseEntity<Object> changeRoomName(ChatRoomNameChange chatRoomNameChange);
    ResponseEntity<Object> deleteChatRoom(ChatDelete chatDelete);
}
