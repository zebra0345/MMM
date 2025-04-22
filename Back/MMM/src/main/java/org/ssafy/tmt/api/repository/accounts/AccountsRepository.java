package org.ssafy.tmt.api.repository.accounts;

import org.springframework.data.jpa.repository.JpaRepository;
import org.ssafy.tmt.api.entity.account.Accounts;
import org.ssafy.tmt.api.entity.user.Users;

import java.util.List;
import java.util.Optional;

public interface AccountsRepository extends JpaRepository<Accounts, Integer>, AccountsCustomRepository {
	Optional<Accounts> findById(int id);
	Optional<Accounts> findByAccountNumber(String accountNumber);
	List<Accounts> findByUser(Users user);
}
