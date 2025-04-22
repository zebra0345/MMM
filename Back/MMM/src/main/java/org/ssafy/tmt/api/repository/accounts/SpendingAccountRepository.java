package org.ssafy.tmt.api.repository.accounts;

import org.springframework.data.jpa.repository.JpaRepository;
import org.ssafy.tmt.api.entity.account.Accounts;
import org.ssafy.tmt.api.entity.account.SpendingAccount;
import org.ssafy.tmt.api.entity.user.Users;

import java.util.List;
import java.util.Optional;

public interface SpendingAccountRepository extends JpaRepository<SpendingAccount, Integer> {
	boolean existsByAccount(Accounts account);
	Optional<SpendingAccount> findByAccount(Accounts account);
	List<SpendingAccount> findAllByAccount(Accounts account);
	Optional<SpendingAccount> findByAccountNumber(String accountNumber);
}
