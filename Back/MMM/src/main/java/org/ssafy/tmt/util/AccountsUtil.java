package org.ssafy.tmt.util;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.ssafy.tmt.api.entity.account.Accounts;
import org.ssafy.tmt.api.repository.accounts.AccountsRepository;

@Component
@RequiredArgsConstructor
public class AccountsUtil {

	private final AccountsRepository accountsRepository;

	public void updateAccountBalance(Accounts account, long newBalance) {
		Accounts updatedAccount = account.toBuilder()
				.balance(newBalance)
				.build();
		accountsRepository.save(updatedAccount);
	}
}
