package org.ssafy.tmt.api.repository.saving;

import org.springframework.data.jpa.repository.JpaRepository;
import org.ssafy.tmt.api.entity.saving.SavingOption;
import org.ssafy.tmt.api.entity.saving.SobiTag;

import java.util.Optional;

public interface SobiTagRepository extends JpaRepository<SobiTag, Integer> {
	Optional<SobiTag> findByName(String name);
}
