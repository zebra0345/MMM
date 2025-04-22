package org.ssafy.tmt.api.repository.saving;

import org.springframework.data.jpa.repository.JpaRepository;
import org.ssafy.tmt.api.entity.account.SavingAccount;
import org.ssafy.tmt.api.entity.saving.AbsSaving;
import org.ssafy.tmt.api.entity.saving.SavingOption;

import java.util.List;
import java.util.Optional;

public interface AbsSavingRepository extends JpaRepository<AbsSaving, Integer> {
	List<AbsSaving> findBySavingOption(SavingOption savingOption);
}
