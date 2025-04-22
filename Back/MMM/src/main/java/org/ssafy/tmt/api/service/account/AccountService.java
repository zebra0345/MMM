package org.ssafy.tmt.api.service.account;

import org.springframework.http.ResponseEntity;
import org.ssafy.tmt.config.security.CustomUserDetails;

import java.util.List;

public interface AccountService {
	ResponseEntity<Object> accountVerifyRequest(String accountNumber);
	ResponseEntity<Object> accountVerifyResponse(String accountNumber, String verifyNumber);
	ResponseEntity<Object> getAccounts(CustomUserDetails customUserDetails);
	ResponseEntity<Object> registerAccount(CustomUserDetails customUserDetails);
}
