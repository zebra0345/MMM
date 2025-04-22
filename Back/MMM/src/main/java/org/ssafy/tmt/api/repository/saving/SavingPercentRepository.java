package org.ssafy.tmt.api.repository.saving;

import org.springframework.data.jpa.repository.JpaRepository;
import org.ssafy.tmt.api.entity.saving.SavingOption;
import org.ssafy.tmt.api.entity.saving.SavingPercent;

import java.util.List;

public interface SavingPercentRepository extends JpaRepository<SavingPercent, Integer> {
	List<SavingPercent> findBySavingOption(SavingOption savingOption);
}
