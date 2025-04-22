package org.ssafy.tmt.api.repository.saving;

import org.springframework.data.jpa.repository.JpaRepository;
import org.ssafy.tmt.api.entity.consumption.Limit;

public interface LimitRepository extends JpaRepository<Limit, Integer> {
}
