package org.ssafy.tmt.api.dto.transaction;

import com.google.type.DateTime;
import lombok.*;
import org.ssafy.tmt.api.entity.saving.AbsSaving;
import org.ssafy.tmt.api.entity.saving.MaxMin;
import org.ssafy.tmt.api.entity.saving.SavingPercent;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@ToString
public class CalculatedSpendingTransactionDto {
	private String spendingAccountNumber;
	// 인출금액
	private long amount;

	// 저축 방식
	private int savingType;

	// 적용된 abs
	private AbsSaving absSavings;

	// 적용된 percent
	private SavingPercent savingPercent;

	// 계산된 값
	private long calculatedSpending;

	// 결제 항목
	private String item;

	// 카테고리
	private String category;

	// 결제 날짜
	private LocalDateTime createdAt;
}
