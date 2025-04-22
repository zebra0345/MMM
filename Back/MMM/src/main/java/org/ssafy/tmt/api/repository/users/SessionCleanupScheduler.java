//package org.ssafy.tmt.api.repository.users;
//
//import org.springframework.scheduling.annotation.Scheduled;
//import org.springframework.transaction.annotation.Transactional;
//import org.springframework.stereotype.Component;
//
//import java.time.LocalDateTime;
//import java.time.ZoneId;
//
//@Component
//public class SessionCleanupScheduler {
//
//    private final SessionRepository sessionRepository;
//
//    public SessionCleanupScheduler(SessionRepository sessionRepository) {
//        this.sessionRepository = sessionRepository;
//    }
//    // @Scheduled(cron = "0 0/15 * * * ?") -> 매 시간 0 / 15 / 30 / 45분 마다 실행 되게 하려면
//
//    @Scheduled(fixedRate = 20 * 60 * 1000)
//    @Transactional
//    public void cleanExpiredSessions() {
//        LocalDateTime now = LocalDateTime.now(ZoneId.of("Asia/Seoul"));
//        sessionRepository.deleteByExpiryTimeBefore(now);
//        System.out.println("⏳ 만료된 세션 정리 완료: " + now);
//    }
//}
