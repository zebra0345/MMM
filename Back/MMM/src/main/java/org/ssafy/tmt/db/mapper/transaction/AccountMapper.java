package org.ssafy.tmt.db.mapper.transaction;

import org.apache.ibatis.annotations.Mapper;
import org.springframework.stereotype.Repository;
import org.ssafy.tmt.api.entity.account.Accounts;
import org.ssafy.tmt.api.dto.account.AccountsBankAndNumber;

import java.util.List;
import java.util.Optional;

@Mapper
@Repository
public interface AccountMapper {
	Optional<Accounts> selectAccountByAccountNumber(String accountNumber);
	void updateAccount(Accounts account);
	List<AccountsBankAndNumber> selectAccountByUserId(int userId);
}
