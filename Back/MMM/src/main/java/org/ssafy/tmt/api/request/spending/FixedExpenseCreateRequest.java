package org.ssafy.tmt.api.request.spending;

import lombok.Getter;

@Getter
public class FixedExpenseCreateRequest {
    private String accountNumber;
    private long amount;
    private String item;
    private int paymentDate;
}
