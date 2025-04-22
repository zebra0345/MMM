package org.ssafy.tmt.db.mapper.transaction;

import org.apache.ibatis.annotations.Mapper;
import org.springframework.stereotype.Repository;
import org.ssafy.tmt.api.entity.account.AccountVerify;

@Mapper
@Repository
public interface AccountVerifyMapper {
	int insertAccountVerify(AccountVerify accountVerify);
}
