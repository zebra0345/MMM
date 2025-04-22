package org.ssafy.tmt.api.repository.transaction;

import com.querydsl.core.types.Projections;
import com.querydsl.core.types.dsl.Expressions;
import com.querydsl.core.types.dsl.NumberExpression;
import com.querydsl.jpa.impl.JPAQueryFactory;
import org.springframework.stereotype.Repository;
import org.ssafy.tmt.api.dto.transaction.FixedExpenseDto;
import org.ssafy.tmt.api.entity.transaction.QSpendingTransaction;
import org.ssafy.tmt.api.entity.transaction.SpendingTransaction;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

@Repository
public class SpendingTransactionRepositoryCustomImpl implements SpendingTransactionRepositoryCustom {

    private final JPAQueryFactory queryFactory;

    public SpendingTransactionRepositoryCustomImpl(JPAQueryFactory queryFactory) {
        this.queryFactory = queryFactory;
    }

    @Override
    public List<FixedExpenseDto> findFixedExpenses(int userId, LocalDateTime startDate, LocalDateTime endDate) {
        QSpendingTransaction spendingTransaction = QSpendingTransaction.spendingTransaction;

        // 날짜에서 day만 추출
        NumberExpression<Integer> paymentDate = Expressions.numberTemplate(Integer.class, "DAY({0})", spendingTransaction.createdAt);

        // 고정지출로 분류되는 카테고리
        List<String> fixedExpenseCategories = Arrays.asList("부동산", "시설관리·임대", "교육", "보건의료");

        return queryFactory
                .select(Projections.constructor(FixedExpenseDto.class, // FixedExpenseDto 생성해서 반환
                        spendingTransaction.amount,
                        spendingTransaction.item,
                        paymentDate
                ))
                .from(spendingTransaction)
                .where(spendingTransaction.user.id.eq(userId)
                        .and(spendingTransaction.createdAt.between(startDate, endDate))
                        .and(spendingTransaction.category.in(fixedExpenseCategories))) // 카테고리 필터링
                .groupBy(spendingTransaction.amount, spendingTransaction.item, paymentDate)
                .having(spendingTransaction.count().goe(3))
                .orderBy(paymentDate.asc())
                .fetch();
    }

    @Override
    public SpendingTransaction findLatestTransactionByFixedExpense(int userId, long amount, String item, int dayOfMonth, LocalDateTime startDate, LocalDateTime endDate) {
        QSpendingTransaction spendingTransaction = QSpendingTransaction.spendingTransaction;

        List<String> fixedExpenseCategories = Arrays.asList("부동산", "시설관리·임대", "교육", "보건의료");

        // 해당 고정지출의 가장 최근 거래 조회
        return queryFactory
                .selectFrom(spendingTransaction)
                .where(spendingTransaction.user.id.eq(userId)
                        .and(spendingTransaction.amount.eq(amount))
                        .and(spendingTransaction.item.eq(item))
                        .and(Expressions.numberTemplate(Integer.class, "DAY({0})", spendingTransaction.createdAt).eq(dayOfMonth))
                        .and(spendingTransaction.createdAt.between(startDate, endDate))
                        .and(spendingTransaction.category.in(fixedExpenseCategories))) // 카테고리 필터링
                .orderBy(spendingTransaction.createdAt.desc())
                .fetchFirst();
    }
}
