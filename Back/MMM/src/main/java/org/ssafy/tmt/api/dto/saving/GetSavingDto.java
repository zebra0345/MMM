package org.ssafy.tmt.api.dto.saving;

import lombok.*;

import java.time.LocalDate;

@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class GetSavingDto {
	private SavingAccountDto savingAccount;
	private long cumulativeFines;
	private long daily;

	@Getter
	@Builder
	public static class SavingAccountDto {
		int savingAccountId;
		String accountNumber;
		long amount;
		long balance;
		boolean pause;
		String bank;
	}
}
