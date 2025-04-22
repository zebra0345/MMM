package org.ssafy.tmt.api.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class AccountVerifyRequest {
	@NotBlank(message = "accountNumber는 필수 값입니다.")
	String accountNumber;

	@Builder
	public AccountVerifyRequest(String accountNumber) {
		this.accountNumber = accountNumber;
	}
}
