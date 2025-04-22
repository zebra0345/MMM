package org.ssafy.tmt.api.controller.account;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.ssafy.tmt.api.request.AccountVerifyRequest;
import org.ssafy.tmt.api.service.account.AccountService;
import org.ssafy.tmt.config.security.CustomUserDetails;
import org.ssafy.tmt.db.mapper.transaction.AccountMapper;

@RestController
@Slf4j
@RequiredArgsConstructor
@RequestMapping("/account")
public class AccountController {

	private final AccountService accountService;
	private final AccountMapper accountMapper;

	@PostMapping("/verify-request")
	public ResponseEntity<Object> accountVerifyRequest(@Valid @RequestBody AccountVerifyRequest accountVerifyRequest,
													   @AuthenticationPrincipal CustomUserDetails customUserDetails) {
		return accountService.accountVerifyRequest(accountVerifyRequest.getAccountNumber());
	}

	@PostMapping("/verify-response")
	public ResponseEntity<Object> accountVerifyResponse(@RequestParam("verifyNumber") String verifyNumber,
														@Valid @RequestBody AccountVerifyRequest accountVerifyRequest,
														@AuthenticationPrincipal CustomUserDetails customUserDetails) {
		return accountService.accountVerifyResponse(accountVerifyRequest.getAccountNumber(), verifyNumber);
	}

	// 아직 회원로직이 구현되지 않아서 임시로 userId 직접입력 해놓음
	@GetMapping
	public ResponseEntity<Object> getAccount(@AuthenticationPrincipal CustomUserDetails customUserDetails) {
		return accountService.getAccounts(customUserDetails);
	}

	@PostMapping
	public ResponseEntity<Object> registerAccount(@AuthenticationPrincipal CustomUserDetails customUserDetails) {
		return accountService.registerAccount(customUserDetails);
	}
}
