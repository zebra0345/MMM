package org.ssafy.tmt.api.repository.saving;

import org.springframework.data.jpa.repository.JpaRepository;
import org.ssafy.tmt.api.entity.account.SavingAccount;
import org.ssafy.tmt.api.entity.saving.CumulativeFines;

import java.util.Optional;

public interface CumulativeFineRepository extends JpaRepository<CumulativeFines, Integer> {
	Optional<CumulativeFines> findBySavingAccount(SavingAccount savingAccount);
}
