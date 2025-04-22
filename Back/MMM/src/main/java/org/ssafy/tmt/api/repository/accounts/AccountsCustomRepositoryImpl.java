package org.ssafy.tmt.api.repository.accounts;

import com.querydsl.core.types.Projections;
import com.querydsl.jpa.impl.JPAQueryFactory;
import org.ssafy.tmt.api.dto.account.AccountsBankAndNumber;
import org.ssafy.tmt.api.entity.account.QAccounts;
import org.ssafy.tmt.api.entity.user.Users;

import java.util.List;

public class AccountsCustomRepositoryImpl implements AccountsCustomRepository {

	private final JPAQueryFactory jpaQueryFactory;

	// 생성자 주입 (Spring이 CustomAccountsRepositoryImpl을 빈으로 등록할 수 있도록 설정)
	public AccountsCustomRepositoryImpl(JPAQueryFactory jpaQueryFactory) {
		this.jpaQueryFactory = jpaQueryFactory;
	}

	@Override
	public List<AccountsBankAndNumber> findAccountsBankAndNumberByUser(Users user) {
		QAccounts qAccounts = QAccounts.accounts;
		return jpaQueryFactory
				.select(Projections.constructor(AccountsBankAndNumber.class, qAccounts.bank, qAccounts.accountNumber, qAccounts.id))
				.from(qAccounts)
				.where(qAccounts.user.eq(user))  // user의 id로 필터링 (필드명은 엔티티에 맞게 조정)
				.fetch();
	}
}
