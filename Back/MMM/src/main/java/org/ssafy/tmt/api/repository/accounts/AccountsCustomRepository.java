package org.ssafy.tmt.api.repository.accounts;

import org.ssafy.tmt.api.dto.account.AccountsBankAndNumber;
import org.ssafy.tmt.api.entity.user.Users;

import java.util.List;

public interface AccountsCustomRepository {
	List<AccountsBankAndNumber> findAccountsBankAndNumberByUser(Users user);
}
