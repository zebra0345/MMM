package org.ssafy.tmt.api.response.spending;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import org.ssafy.tmt.api.entity.account.SpendingAccount;
import org.ssafy.tmt.api.entity.spending.FixedExpense;

@Getter
@AllArgsConstructor
@Builder
public class FixedExpenseResponse {
    private int id;
    private String accountNumber;
    private String bank;
    private long amount;
    private String item;
    private int paymentDate;

    public static FixedExpenseResponse fromFixedExpense(FixedExpense fixedExpense) {
        SpendingAccount spendingAccount = fixedExpense.getSpendingAccount();

        return FixedExpenseResponse.builder()
                .id(fixedExpense.getId())
                .accountNumber(spendingAccount != null ? spendingAccount.getAccountNumber() : null)
                .bank(spendingAccount != null ? spendingAccount.getBank() : null)
                .amount(fixedExpense.getAmount())
                .item(fixedExpense.getItem())
                .paymentDate(fixedExpense.getPaymentDate())
                .build();
    }
}
