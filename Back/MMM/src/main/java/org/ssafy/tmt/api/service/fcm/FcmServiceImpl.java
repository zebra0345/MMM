package org.ssafy.tmt.api.service.fcm;

import com.google.firebase.messaging.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.ssafy.tmt.api.dto.Elastic.User;
import org.ssafy.tmt.api.entity.fcm.FcmMessage;
import org.ssafy.tmt.api.entity.fcm.FcmToken;
import org.ssafy.tmt.api.entity.user.Users;
import org.ssafy.tmt.api.repository.fcm.FcmMessageRepository;
import org.ssafy.tmt.api.repository.fcm.FcmTokenRepository;
import org.ssafy.tmt.api.repository.users.UsersRepository;
import org.ssafy.tmt.api.request.fcm.FcmMessageDeleteRequest;
import org.ssafy.tmt.api.request.fcm.FcmReadRequest;
import org.ssafy.tmt.api.request.fcm.FcmRegisterRequestDto;
import org.ssafy.tmt.api.request.fcm.FcmRequestDto;
import org.ssafy.tmt.config.security.CustomUserDetails;
import org.ssafy.tmt.exception.GeneralException;
import org.ssafy.tmt.util.ErrorCode;
import org.ssafy.tmt.util.MessageUtil;
import org.ssafy.tmt.util.Response;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@Slf4j
@RequiredArgsConstructor
public class FcmServiceImpl implements FcmService {

	private final UsersRepository usersRepository;
	private final FcmTokenRepository fcmTokenRepository;
	private final FcmMessageRepository fcmMessageRepository;

	@Override
	public void sendMessageTo(FcmRequestDto fcmRequestDto, Users user) throws IOException {
		List<FcmToken> fcmTokens = fcmTokenRepository.findByUser(user);
		List<String> tokenList = new ArrayList<>();
		if (fcmTokens.isEmpty()) {
			return;
		}

		for (FcmToken token : fcmTokens) {
			tokenList.add(token.getDeviceToken());
		}

		MulticastMessage message = MulticastMessage.builder()
				.addAllTokens(tokenList)
				.putData("title", fcmRequestDto.getTitle())
				.putData("body", fcmRequestDto.getBody())
				.putData("click_action", fcmRequestDto.getClickAction())  // 클릭 시 경로
				.putData("warn", String.valueOf(fcmRequestDto.isWarn()))
				.build();

		BatchResponse response;

		FcmMessage fcmMessage = FcmMessage.builder()
				.user(user)
				.title(fcmRequestDto.getTitle())
				.body(fcmRequestDto.getBody())
				.clickAction("/consumption")
				.warn(fcmRequestDto.isWarn())
				.build();

		fcmMessageRepository.save(fcmMessage);

		try {
			response = FirebaseMessaging.getInstance().sendEachForMulticast(message, false);
			log.info("전송 성공한 메시지 개수: {}", response.getSuccessCount());
		} catch (FirebaseMessagingException e) {
			log.error("FCM 메시지 전송 중 오류 발생", e);
			throw new GeneralException(ErrorCode.FCM_SEND_ERROR);
		}
	}

	@Override
	@Transactional
	public ResponseEntity<Object> register(FcmRegisterRequestDto fcmRegisterRequestDto, CustomUserDetails customUserDetails) throws IOException {
		Optional<Users> usersOptional = usersRepository.findById(customUserDetails.getId());
		if (usersOptional.isEmpty()) {
			log.error("유저가 없음");
			return Response.Response(HttpStatus.NOT_FOUND, MessageUtil.buildMessage("유저가 없음"));
		}
		Users user = usersOptional.get();

		if (fcmTokenRepository.existsByDeviceTokenAndUser(fcmRegisterRequestDto.getDeviceToken(), user)) {
			log.error("토큰이 이미 있음");
			return Response.Response(HttpStatus.OK, MessageUtil.buildMessage("토큰이 이미 있음"));
		} else if (fcmTokenRepository.existsByDeviceToken(fcmRegisterRequestDto.getDeviceToken())) {
			Optional<FcmToken> fcmTokenOptional = fcmTokenRepository.findByDeviceToken(fcmRegisterRequestDto.getDeviceToken());
			fcmTokenOptional.ifPresent(fcmTokenRepository::delete);
		}

		FcmToken fcmToken = FcmToken.builder()
				.deviceToken(fcmRegisterRequestDto.getDeviceToken())
				.user(user)
				.build();

		fcmTokenRepository.save(fcmToken);

		return Response.Response(HttpStatus.OK, MessageUtil.buildMessage("토큰 등록 완료"));
	}

	@Override
	@Transactional
	public ResponseEntity<Object> getMessage(CustomUserDetails customUserDetails) {
		Optional<Users> usersOptional = usersRepository.findById(customUserDetails.getId());
		if (usersOptional.isEmpty()) {
			log.error("유저가 없음");
			return Response.Response(HttpStatus.NOT_FOUND, MessageUtil.buildMessage("유저가 없음"));
		}
		Users user = usersOptional.get();

		List<FcmMessage> fcmMessageList = fcmMessageRepository.findByUser(user);

		return Response.Response(HttpStatus.OK, fcmMessageList);
	}

	@Override
	@Transactional
	public ResponseEntity<Object> readMessage(FcmReadRequest fcmReadRequest) {
		Optional<FcmMessage> fcmMessageOptional = fcmMessageRepository.findById(fcmReadRequest.getId());
		if (fcmMessageOptional.isEmpty()) {
			log.error("메세지가 없음");
			return Response.Response(HttpStatus.NOT_FOUND, MessageUtil.buildMessage("매세지가 없음"));
		}

		FcmMessage fcmMessage = fcmMessageOptional.get();

		fcmMessage.readMessage();

		return Response.Response(HttpStatus.OK, MessageUtil.buildMessage("success"));
	}

	@Override
	@Transactional
	public ResponseEntity<Object> deleteMessage(FcmMessageDeleteRequest fcmMessageDeleteRequest) {
		fcmMessageRepository.deleteAllById(fcmMessageDeleteRequest.getId());

		return Response.Response(HttpStatus.OK, MessageUtil.buildMessage("success"));
	}
}
