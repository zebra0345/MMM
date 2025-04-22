package org.ssafy.tmt.api.response.saving;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.ssafy.tmt.api.entity.account.Accounts;
import org.ssafy.tmt.api.entity.account.SavingAccount;
import org.ssafy.tmt.api.entity.account.SpendingAccount;
import org.ssafy.tmt.api.entity.saving.*;
import org.ssafy.tmt.api.entity.transaction.SavingTransaction;
import org.ssafy.tmt.api.entity.transaction.SpendingTransaction;

import java.util.List;

@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class TestPageDto {
	private SavingAccount savingAccount;
	private Accounts AccountInSavingAccount;
	private List<SavingTransaction> savingTransactions;
	private SpendingAccount spendingAccount;
	private Accounts AccountInSpendingAccount;
	private List<SpendingTransaction> spendingTransactions;
	private List<AbsSaving> absSavings;
	private List<SavingPercent> savingPercents;
	private MaxMin maxMin;
	private MoneyFlow moneyFlow;
	private SavingOption savingOption;
}
