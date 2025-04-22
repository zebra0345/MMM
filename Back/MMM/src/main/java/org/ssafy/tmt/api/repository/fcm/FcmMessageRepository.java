package org.ssafy.tmt.api.repository.fcm;

import org.springframework.data.jpa.repository.JpaRepository;
import org.ssafy.tmt.api.entity.fcm.FcmMessage;
import org.ssafy.tmt.api.entity.user.Users;

import java.util.List;

public interface FcmMessageRepository extends JpaRepository<FcmMessage, Integer> {
	List<FcmMessage> findByUser(Users user);
}
