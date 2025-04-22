package org.ssafy.tmt.api.repository.saving;

import org.springframework.data.jpa.repository.JpaRepository;
import org.ssafy.tmt.api.entity.consumption.MaxLimit;

public interface MaxLimitRepository extends JpaRepository<MaxLimit, Integer> {
}
