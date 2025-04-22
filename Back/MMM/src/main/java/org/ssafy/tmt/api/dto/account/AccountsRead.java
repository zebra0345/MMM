package org.ssafy.tmt.api.dto.account;

import lombok.*;

import java.util.List;

@Getter
@NoArgsConstructor
@ToString
public class AccountsRead {
	List<AccountsBankAndNumber> accounts;
	String message;

	@Builder
	public AccountsRead(List<AccountsBankAndNumber> accounts, String message) {
		this.accounts = accounts;
		this.message = message;
	}
}
