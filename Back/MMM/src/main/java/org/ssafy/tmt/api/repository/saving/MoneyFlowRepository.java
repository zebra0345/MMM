package org.ssafy.tmt.api.repository.saving;

import org.springframework.data.jpa.repository.JpaRepository;
import org.ssafy.tmt.api.entity.account.SavingAccount;
import org.ssafy.tmt.api.entity.account.SpendingAccount;
import org.ssafy.tmt.api.entity.saving.MoneyFlow;

import java.util.List;
import java.util.Optional;
import java.util.stream.Stream;

public interface MoneyFlowRepository extends JpaRepository<MoneyFlow, Integer> {
    List<MoneyFlow> findBySavingAccount(SavingAccount savingAccount);
	Optional<MoneyFlow> findBySavingAccountAndSpendingAccount(SavingAccount savingAccount, SpendingAccount spendingAccount);
	boolean existsBySavingAccountAndSpendingAccount(SavingAccount savingAccount, SpendingAccount spendingAccount);
}
