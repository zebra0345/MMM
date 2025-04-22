package org.ssafy.tmt.api.controller.fcm;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.ssafy.tmt.api.entity.user.Users;
import org.ssafy.tmt.api.repository.users.UsersRepository;
import org.ssafy.tmt.api.request.fcm.FcmMessageDeleteRequest;
import org.ssafy.tmt.api.request.fcm.FcmReadRequest;
import org.ssafy.tmt.api.request.fcm.FcmRegisterRequestDto;
import org.ssafy.tmt.api.request.fcm.FcmRequestDto;
import org.ssafy.tmt.api.service.fcm.FcmService;
import org.ssafy.tmt.config.security.CustomUserDetails;
import org.ssafy.tmt.util.MessageUtil;
import org.ssafy.tmt.util.Response;

import java.io.IOException;
import java.util.Optional;

@RestController
@RequiredArgsConstructor
@Slf4j
@RequestMapping("/fcm")
public class FcmController {

	private final FcmService fcmService;
	private final UsersRepository usersRepository;

	@PostMapping
	public ResponseEntity<Object> registerAccount(@RequestBody FcmRegisterRequestDto fcmRegisterRequestDto, @AuthenticationPrincipal CustomUserDetails customUserDetails) throws IOException {
		return fcmService.register(fcmRegisterRequestDto, customUserDetails);
	}

	@PostMapping("/pushMessage")
	public ResponseEntity<Object> pushMessage(@RequestBody FcmRequestDto fcmRequestDto, @AuthenticationPrincipal CustomUserDetails customUserDetails) throws IOException {
		Optional<Users> usersOptional = usersRepository.findById(customUserDetails.getId());
		Users user = null;
		if (usersOptional.isPresent()) {
			user = usersOptional.get();
		}
		fcmService.sendMessageTo(fcmRequestDto, user);
		return Response.Response(HttpStatus.OK, MessageUtil.buildMessage("Successfully pushed message"));
	}

	@GetMapping
	public ResponseEntity<Object> getMessages(@AuthenticationPrincipal CustomUserDetails customUserDetails) {
		return fcmService.getMessage(customUserDetails);
	}

	@PatchMapping
	public ResponseEntity<Object> readMessage(@RequestBody FcmReadRequest fcmReadRequest, @AuthenticationPrincipal CustomUserDetails customUserDetails) {
		return fcmService.readMessage(fcmReadRequest);
	}

	@DeleteMapping
	public ResponseEntity<Object> deleteMessage(@RequestBody FcmMessageDeleteRequest fcmMessageDeleteRequest, @AuthenticationPrincipal CustomUserDetails customUserDetails) {
		return fcmService.deleteMessage(fcmMessageDeleteRequest);
	}
}
