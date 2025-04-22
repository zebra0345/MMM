package org.ssafy.tmt.api.repository.transaction;

import org.ssafy.tmt.api.dto.transaction.FixedExpenseDto;
import org.ssafy.tmt.api.entity.transaction.SpendingTransaction;

import java.time.LocalDateTime;
import java.util.List;

public interface SpendingTransactionRepositoryCustom {
    List<FixedExpenseDto> findFixedExpenses(int userId, LocalDateTime startDate, LocalDateTime endDate);
    // 해당 고정지출의 가장 최근 거래 조회
    SpendingTransaction findLatestTransactionByFixedExpense(int userId, long amount, String item, int dayOfMonth, LocalDateTime startDate, LocalDateTime endDate);
}
