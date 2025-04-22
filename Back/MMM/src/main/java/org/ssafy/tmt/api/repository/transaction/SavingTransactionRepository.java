package org.ssafy.tmt.api.repository.transaction;

import org.springframework.data.jpa.repository.JpaRepository;
import org.ssafy.tmt.api.entity.account.SavingAccount;
import org.ssafy.tmt.api.entity.transaction.SavingTransaction;

import java.util.List;

public interface SavingTransactionRepository extends JpaRepository<SavingTransaction, Integer> {
	List<SavingTransaction> findBySavingAccount(SavingAccount savingAccount);
}
