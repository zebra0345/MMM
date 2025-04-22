package org.ssafy.tmt.api.repository.transaction;

import org.springframework.data.jpa.repository.JpaRepository;
import org.ssafy.tmt.api.entity.account.Accounts;
import org.ssafy.tmt.api.entity.transaction.VerifyTransaction;

import java.util.Optional;

public interface VerifyTransactionRepository extends JpaRepository<VerifyTransaction, Integer> {
	Optional<VerifyTransaction> findByAccountAndVerifyNumber(Accounts account, String verifyNumber);
}
