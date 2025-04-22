package org.ssafy.tmt.api.repository.saving;

import org.springframework.data.jpa.repository.JpaRepository;
import org.ssafy.tmt.api.entity.account.SavingAccount;
import org.ssafy.tmt.api.entity.saving.SavingOption;

import java.util.Optional;

public interface SavingOptionRepository extends JpaRepository<SavingOption, Integer> {
	Optional<SavingOption> findBySavingAccount(SavingAccount savingAccount);
}
