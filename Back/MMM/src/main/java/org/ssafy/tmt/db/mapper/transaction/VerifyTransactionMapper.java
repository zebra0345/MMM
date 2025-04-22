package org.ssafy.tmt.db.mapper.transaction;

import org.apache.ibatis.annotations.Mapper;
import org.springframework.stereotype.Repository;
import org.ssafy.tmt.api.entity.transaction.VerifyTransaction;

import java.util.Optional;

@Mapper
@Repository
public interface VerifyTransactionMapper {
	int insertVerifyTransaction(VerifyTransaction transaction);
	Optional<VerifyTransaction> selectVerifyTransactionByAccountNumberAndVerifyNumber(String accountNumber, String verifyNumber);
}
