package org.ssafy.tmt.api.repository.accounts;

import org.springframework.data.jpa.repository.JpaRepository;
import org.ssafy.tmt.api.entity.account.AccountVerify;
import org.ssafy.tmt.api.entity.account.Accounts;

public interface AccountVerifyRepository extends JpaRepository<AccountVerify, Integer> {
	boolean existsByAccount(Accounts account);
}
