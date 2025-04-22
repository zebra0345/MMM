package org.ssafy.tmt.api.repository.spending;

import org.springframework.data.jpa.repository.JpaRepository;
import org.ssafy.tmt.api.entity.spending.DailyReport;
import org.ssafy.tmt.api.entity.user.Users;

import java.time.LocalDate;
import java.util.Optional;

public interface DailyReportRepository extends JpaRepository<DailyReport, Integer> {
    Optional<DailyReport> findByUsersAndDailyReportDate(Users user, LocalDate date);
}
