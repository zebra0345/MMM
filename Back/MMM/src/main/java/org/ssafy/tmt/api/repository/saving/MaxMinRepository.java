package org.ssafy.tmt.api.repository.saving;

import org.springframework.data.jpa.repository.JpaRepository;
import org.ssafy.tmt.api.entity.saving.MaxMin;
import org.ssafy.tmt.api.entity.saving.SavingOption;

import java.util.Optional;

public interface MaxMinRepository extends JpaRepository<MaxMin, Integer> {
	Optional<MaxMin> findBySavingOption(SavingOption savingOption);
}
