package org.ssafy.tmt.api.dto.transaction;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class FixedExpenseDto {
    private long amount;     // 결제 금액
    private String item;     // 결제 항목
    private int paymentDate; // 결제일
}
