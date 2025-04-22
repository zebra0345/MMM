package org.ssafy.tmt.api.repository.fcm;

import org.springframework.data.jpa.repository.JpaRepository;
import org.ssafy.tmt.api.entity.fcm.FcmToken;
import org.ssafy.tmt.api.entity.user.Users;

import java.util.List;
import java.util.Optional;

public interface FcmTokenRepository extends JpaRepository<FcmToken, Integer> {
	List<FcmToken> findByUser(Users user);
	boolean existsByDeviceTokenAndUser(String deviceToken, Users user);
	boolean existsByDeviceToken(String deviceToken);
	Optional<FcmToken> findByDeviceToken(String deviceToken);
}
