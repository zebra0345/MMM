package org.ssafy.tmt.api.repository.spending;

import org.springframework.data.jpa.repository.JpaRepository;
import org.ssafy.tmt.api.entity.account.SpendingAccount;
import org.ssafy.tmt.api.entity.spending.FixedExpense;
import org.ssafy.tmt.api.entity.user.Users;

import java.util.List;
import java.util.Optional;

public interface FixedExpenseRepository extends JpaRepository<FixedExpense, Integer> {
    // user의 모든 고정지출 조회
    List<FixedExpense> findByUserAndIsDeletedFalse(Users user);

    // user, amount, item 으로 고정지출 조회
    Optional<FixedExpense> findByUserAndAmountAndItem(Users user, long amount, String item);

    Optional<FixedExpense> findById(int id);

	List<FixedExpense> findBySpendingAccount(SpendingAccount spendingAccount);
}
