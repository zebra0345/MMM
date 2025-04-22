package org.ssafy.tmt.api.service.fcm;

import org.springframework.http.ResponseEntity;
import org.ssafy.tmt.api.entity.user.Users;
import org.ssafy.tmt.api.request.fcm.FcmMessageDeleteRequest;
import org.ssafy.tmt.api.request.fcm.FcmReadRequest;
import org.ssafy.tmt.api.request.fcm.FcmRegisterRequestDto;
import org.ssafy.tmt.api.request.fcm.FcmRequestDto;
import org.ssafy.tmt.config.security.CustomUserDetails;

import java.io.IOException;

public interface FcmService {
	void sendMessageTo(FcmRequestDto fcmRequestDto, Users user) throws IOException;
	ResponseEntity<Object> register(FcmRegisterRequestDto fcmRegisterRequestDto, CustomUserDetails customUserDetails) throws IOException;
	ResponseEntity<Object> getMessage(CustomUserDetails customUserDetails);
	ResponseEntity<Object> readMessage(FcmReadRequest fcmReadRequest);
	ResponseEntity<Object> deleteMessage(FcmMessageDeleteRequest fcmMessageDeleteRequest);
}
