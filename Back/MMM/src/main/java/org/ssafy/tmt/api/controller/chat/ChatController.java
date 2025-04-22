package org.ssafy.tmt.api.controller.chat;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.ssafy.tmt.api.dto.chat.*;
import org.ssafy.tmt.api.request.chat.SearchUserRequest;
import org.ssafy.tmt.api.service.chat.ChatService;
import org.ssafy.tmt.config.security.CustomUserDetails;

@RestController
@Slf4j
@RequiredArgsConstructor
@RequestMapping("/chat")
public class ChatController {

    private final ChatService chatService;
    private final SimpMessagingTemplate template;


    @PostMapping("/search")
    public ResponseEntity<Object> SearchUser(@RequestBody SearchUserRequest searchUserRequest) {
        return chatService.SearchUser(searchUserRequest);
    }

    @PostMapping("/room")
    public ResponseEntity<Object> createRoom(@RequestBody ChatRoomDto chatRoomDto) {
        return chatService.createRoom(chatRoomDto);
    }

    @GetMapping("/room")
    public ResponseEntity<Object> getRoom(@AuthenticationPrincipal CustomUserDetails customUserDetails) {
        return chatService.findRoomById(customUserDetails);
    }

    @MessageMapping("/messages")
    public ResponseEntity<Object> sendMessage(@RequestBody ChatMessageDto chatMessageDto) {
        return chatService.sendMessage(chatMessageDto);
    }

    @PostMapping("/logs")
    public ResponseEntity<Object> getChatLog(@RequestBody ChatLogDto chatLogDto) {
        return chatService.getChatLog(chatLogDto);
    }

    @PostMapping("/change-roomname")
    public ResponseEntity<Object> changeRoomName(@RequestBody ChatRoomNameChange chatRoomNameChange) {
        return chatService.changeRoomName(chatRoomNameChange);
    }

    @DeleteMapping("")
    public ResponseEntity<Object> deleteChatRoom(@RequestBody ChatDelete chatDelete) {
        return chatService.deleteChatRoom(chatDelete);
    }


}
