package org.ssafy.tmt.api.repository.users;

import org.springframework.data.jpa.repository.JpaRepository;
import org.ssafy.tmt.api.entity.user.Users;

import java.util.Optional;

public interface UsersRepository extends JpaRepository<Users, Integer> {
	@Override
	Optional<Users> findById(Integer id);
	Optional<Users> findByEmail(String email);
}
