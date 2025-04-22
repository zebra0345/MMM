package org.ssafy.tmt.api.repository.users;

import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.ssafy.tmt.api.entity.user.Session;

import java.time.LocalDateTime;
import java.util.Optional;

public interface SessionRepository extends JpaRepository<Session, Integer> {
    Optional<Session> findBySessionId(Integer id);

    Optional<Session> findByEmail(String email);

    @Modifying
    @Transactional
    void deleteByExpiryTimeBefore(LocalDateTime now);

    @Modifying
    @Transactional
    @Query("DELETE FROM Session s WHERE s.sessionId = :sessionId")
    void deleteBySessionId(Integer sessionId);

}
