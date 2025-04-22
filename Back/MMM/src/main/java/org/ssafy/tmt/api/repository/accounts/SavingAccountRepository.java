package org.ssafy.tmt.api.repository.accounts;

import org.springframework.data.jpa.repository.JpaRepository;
import org.ssafy.tmt.api.entity.account.Accounts;
import org.ssafy.tmt.api.entity.account.SavingAccount;
import org.ssafy.tmt.api.entity.user.Users;

import java.util.List;
import java.util.Optional;

public interface SavingAccountRepository extends JpaRepository<SavingAccount, Integer> {
	boolean existsByAccount(Accounts account);
	List<SavingAccount> findByAccount(Accounts account);
	Optional<SavingAccount> findByUser(Users user);
	Optional<SavingAccount> findByAccountNumber(String accountNumber);
	boolean existsByUser(Users user);
}
