package org.ssafy.tmt.api.repository.transaction;

import org.springframework.data.jpa.repository.JpaRepository;
import org.ssafy.tmt.api.entity.account.SavingAccount;
import org.ssafy.tmt.api.entity.account.SpendingAccount;
import org.ssafy.tmt.api.entity.transaction.SpendingTransaction;
import org.ssafy.tmt.api.entity.user.Users;

import java.time.LocalDateTime;
import java.util.List;

public interface SpendingTransactionRepository extends JpaRepository<SpendingTransaction, Integer>, SpendingTransactionRepositoryCustom {
	List<SpendingTransaction> findBySpendingAccountAndCreatedAtAfter(SpendingAccount spendingAccount, LocalDateTime wantTime);
	List<SpendingTransaction> findBySpendingAccountAndCreatedAtBetween(
			SpendingAccount spendingAccount,
			LocalDateTime start,
			LocalDateTime end
	);
	List<SpendingTransaction> findByUserAndCreatedAtAfter(Users user, LocalDateTime wantTime);

	List<SpendingTransaction> findByCreatedAtBetween(
			LocalDateTime start,
			LocalDateTime end
	);

	List<SpendingTransaction> findBySavingAccount(SavingAccount savingAccount);
	List<SpendingTransaction> findBySpendingAccount(SpendingAccount spendingAccount);

	List<SpendingTransaction> findByUserAndCreatedAtBetweenAndCategoryNot(
			Users user,
			LocalDateTime start,
			LocalDateTime end,
			String excludeCategory
	);
	List<SpendingTransaction> findByUserAndCreatedAtBetween(Users user, LocalDateTime start, LocalDateTime end);

}
