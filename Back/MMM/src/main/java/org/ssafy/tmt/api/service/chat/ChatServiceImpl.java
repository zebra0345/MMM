package org.ssafy.tmt.api.service.chat;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.ssafy.tmt.api.dto.Elastic.ElasticUser;
import org.ssafy.tmt.api.dto.Elastic.User;
import org.ssafy.tmt.api.dto.chat.*;
import org.ssafy.tmt.api.entity.chat.ChatLog;
import org.ssafy.tmt.api.entity.chat.ChatPeople;
import org.ssafy.tmt.api.entity.chat.ChatRoom;
import org.ssafy.tmt.api.entity.user.Users;
import org.ssafy.tmt.api.repository.accounts.SavingAccountRepository;
import org.ssafy.tmt.api.repository.chat.ChatLogRepository;
import org.ssafy.tmt.api.repository.chat.ChatPeopleRepository;
import org.ssafy.tmt.api.repository.chat.ChatRoomRepository;
import org.ssafy.tmt.api.repository.elastic.UserSearchRepository;
import org.ssafy.tmt.api.repository.users.UsersRepository;
import org.ssafy.tmt.api.request.chat.SearchUserRequest;
import org.ssafy.tmt.config.security.CustomUserDetails;
import org.ssafy.tmt.exception.UnauthorizedException;
import org.ssafy.tmt.util.MessageUtil;
import org.ssafy.tmt.util.Response;

import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class ChatServiceImpl implements ChatService {

    private final UserSearchRepository userSearchRepository;
    private final SavingAccountRepository savingAccountRepository;
    private final ChatRoomRepository chatRoomRepository;
    private final ChatPeopleRepository chatPeopleRepository;
    private final UsersRepository usersRepository;
    private final SimpMessagingTemplate simpMessagingTemplate;
    private final ChatLogRepository chatLogRepository;

    public ResponseEntity<Object> SearchUser(SearchUserRequest searchUserRequest) {
        String email = searchUserRequest.getEmail();

        List<ElasticUser> elasticUsers = userSearchRepository.findByEmailEqualsIgnoreCase(email);

        List<User> userDto = new ArrayList<>();

        if(!elasticUsers.isEmpty()) {
            for(ElasticUser elasticUser : elasticUsers) {
                User user = User.builder()
                        .id(elasticUser.getId())
                        .email(elasticUser.getEmail())
                        .name(elasticUser.getName())
                        .build();
                userDto.add(user);
            }
            Map<String, Object> resultMap = new HashMap<>();
            resultMap.put("message", "success");
            resultMap.put("userDto", userDto);

            return Response.Response(HttpStatus.OK, resultMap);
        }
        else {
            return Response.Response(HttpStatus.OK, MessageUtil.buildMessage("검색된 사용자가 없습니다."));
//            return Response.Response(HttpStatus.INTERNAL_SERVER_ERROR, MessageUtil.buildMessage("회원 조회 중 오류 발생"));
        }
    }

    public ResponseEntity<Object> createRoom(ChatRoomDto chatRoomDto) {
        // 사용자들만 받아서 채팅방을 생성한다.
        List<Integer> userIds = chatRoomDto.getUserIds();

        ChatRoom chatRoom = ChatRoom.builder()
                .roomName(chatRoomDto.getRoomName())
                .build();
        ChatRoom savedChatRoom = chatRoomRepository.save(chatRoom);

        int chatRoomId = savedChatRoom.getId();
        System.out.println(chatRoomId);

        for(Integer userId : userIds) {
            Optional<Users> usersOptional = usersRepository.findById(userId);
            if(usersOptional.isPresent()) {
                Users users = usersOptional.get();
                ChatPeople chatPeople = ChatPeople.builder()
                        .users(users)
                        .chatRoom(savedChatRoom)
                        .build();
                chatPeopleRepository.save(chatPeople);
            }
        }
        return Response.Response(HttpStatus.OK, MessageUtil.buildMessage("success"));
    }

    public ResponseEntity<Object> findRoomById(CustomUserDetails customUserDetails) {
        // 인원, 채팅방 명
        checkAuthentication(customUserDetails);

        int userId = customUserDetails.getId();
        // 사용자 id를 가져옴
        System.out.println("사용자 id " + userId);
        List<ChatPeople> chatPeopleList = chatPeopleRepository.findByUsersId(userId);

        HashMap<String, Object> resultMap = new HashMap<>();

        if(!chatPeopleList.isEmpty()) {

            resultMap.put("message", "success");

            List<Map<String, Object>> itemList = new ArrayList<>();

            for(ChatPeople chatPeople : chatPeopleList) {
                int chatRoomId = chatPeople.getChatRoom().getId();
                // 채팅방 번호를 가져와야 한다.
                System.out.println("ChatRoom ID: " + chatRoomId);

                Optional<ChatRoom> optionalChatRoom = chatRoomRepository.findById(chatRoomId);
                ChatLog latestChatLog = chatLogRepository.findTopByChatRoomIdOrderByCreatedAtDesc(chatRoomId);

                if(optionalChatRoom.isPresent()) {
                    ChatRoom chatRoom = optionalChatRoom.get();
                    int totalPeople = chatPeopleRepository.countByChatRoomId(chatRoomId);
                    String chatRoomName = chatRoom.getRoomName();

                    List<ChatPeople> people = chatPeopleRepository.findByChatRoomId(chatRoomId);
                    List<Object> peopleList = new ArrayList<>();
                    for (ChatPeople person : people) {
                        peopleList.add(person.getUsers().getName());
                    }

                    Map<String, Object> itemMap = new HashMap<>();
                    itemMap.put("roomId", chatRoomId);
                    itemMap.put("chatRoomName", chatRoomName);
                    itemMap.put("totalPeople", totalPeople);
                    itemMap.put("peopleList", peopleList);
                    itemMap.put("latestChatLog", latestChatLog);

                    itemList.add(itemMap);

                } else {
                    return Response.Response(HttpStatus.INTERNAL_SERVER_ERROR, MessageUtil.buildMessage("채팅방이 없습니다."));
                }

            }
            resultMap.put("items", itemList);
            return Response.Response(HttpStatus.OK, resultMap);

        } else {
            resultMap.put("message", "사용자가 참여한 방이 없습니다.");
            resultMap.put("items", new ArrayList<>());
            return Response.Response(HttpStatus.OK, resultMap);
        }
    }

    public ResponseEntity<Object> sendMessage(ChatMessageDto chatMessageDto) {
        String type = chatMessageDto.getType().toString();
        System.out.println(type);
        if(type.equals("TALK")) {
            System.out.println(chatMessageDto.getRoomId());
            System.out.println(chatMessageDto.getMessage());
            System.out.println(chatMessageDto.getSender());
            System.out.println(chatMessageDto.getUserId());
            Optional<ChatRoom> optionalChatRoom = chatRoomRepository.findById(chatMessageDto.getRoomId());
            if(optionalChatRoom.isPresent()) {
                ChatRoom chatRoom = optionalChatRoom.get();
                Optional<Users> optionalUsers = usersRepository.findById(chatMessageDto.getUserId());
                if(optionalUsers.isPresent()) {
                    Users users = optionalUsers.get();
                    ChatLog chatLog = ChatLog.builder()
                            .message(chatMessageDto.getMessage())
                            .chatRoom(chatRoom)
                            .users(users)
                            .build();
                    chatLogRepository.save(chatLog);
                }

            }

            simpMessagingTemplate.convertAndSend("/sub/chat/" + chatMessageDto.getRoomId(), chatMessageDto);

        }
        else if(type.equals("ENTER")) {

        }

        return Response.Response(HttpStatus.OK, MessageUtil.buildMessage("success"));
    }

    private void checkAuthentication(CustomUserDetails customUserDetails) {
        if (customUserDetails == null) {
            throw new UnauthorizedException("사용자 인증 문제가 발생했습니다.");
        }
    }


    public ResponseEntity<Object> getChatLog(ChatLogDto chatLogDto) {
        int intRoomId = Integer.parseInt(chatLogDto.getRoomId());
        ChatRoom chatRoom = chatRoomRepository.findById(intRoomId)
                .orElseThrow(() -> new EntityNotFoundException("해당 채팅방을 찾을 수 없습니다."));
        List<ChatLog> chatLogList = chatLogRepository.findTop30ByChatRoom_IdOrderByCreatedAtDesc(intRoomId);
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MM-dd HH:mm");

        HashMap<String, Object> resultMap = new HashMap<>();
        List<Map<String, Object>> chatLogs = new ArrayList<>();

        for(ChatLog chatLog : chatLogList) {
            Map<String, Object> chatMap = new HashMap<>();
            Optional<Users> optionalUsers = usersRepository.findById(chatLog.getUsers().getId());
            if(optionalUsers.isPresent()) {
                Users users = optionalUsers.get();
                chatMap.put("name", users.getName());
                chatMap.put("message", chatLog.getMessage());
                chatMap.put("userId", users.getId());

                String formattedTime = chatLog.getCreatedAt().format(formatter);
                chatMap.put("createdAt", formattedTime);
                chatLogs.add(chatMap);
            }

        }
        resultMap.put("chatLogs", chatLogs);
        resultMap.put("roomName", chatRoom.getRoomName());
        resultMap.put("status", "success");

        return Response.Response(HttpStatus.OK, resultMap);
    }

    public ResponseEntity<Object> changeRoomName(ChatRoomNameChange chatRoomNameChange) {

        Optional<ChatRoom> optionalChatRoom = chatRoomRepository.findById(chatRoomNameChange.getRoomId());
        if(optionalChatRoom.isPresent()) {
            ChatRoom chatRoom = optionalChatRoom.get();
            if(chatRoomNameChange.getRoomName() == null || chatRoomNameChange.getRoomName().isEmpty()) {
                return Response.Response(HttpStatus.INTERNAL_SERVER_ERROR, MessageUtil.buildMessage("수정할 채팅방 이름이 들어오지 않았습니다."));
            }
            else {
                chatRoom.setRoomName(chatRoomNameChange.getRoomName());
                chatRoomRepository.save(chatRoom);
                return Response.Response(HttpStatus.OK, MessageUtil.buildMessage("success"));
            }
        }
        else {
            return Response.Response(HttpStatus.INTERNAL_SERVER_ERROR, MessageUtil.buildMessage("채팅방이 없습니다."));
        }
    }

    public ResponseEntity<Object> deleteChatRoom(ChatDelete chatDelete) {
        // 채팅방과 chat people에서 roomId 포함되는거 지워야 한다
        Optional<ChatRoom> optionalChatRoom = chatRoomRepository.findById(chatDelete.getRoomId());
        if(optionalChatRoom.isPresent()) {
            List<ChatPeople> chatPeopleList = chatPeopleRepository.findByChatRoomId(chatDelete.getRoomId());
            if(!chatPeopleList.isEmpty()) {
                chatPeopleRepository.deleteAll(chatPeopleList);
            }
            chatRoomRepository.deleteById(chatDelete.getRoomId());
            return Response.Response(HttpStatus.OK, MessageUtil.buildMessage("success"));
        } else {
            return Response.Response(HttpStatus.INTERNAL_SERVER_ERROR, MessageUtil.buildMessage("채팅방이 없습니다."));
        }
    }

}
