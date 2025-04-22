package org.ssafy.tmt.api.dto.account;

import lombok.*;

@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@ToString
public class AccountsBankAndNumber {
	String bank;
	String accountNumber;
	int accountId;
}
