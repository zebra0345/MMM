package org.ssafy.tmt.saving;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;
import org.ssafy.tmt.api.dto.saving.PauseSavingDto;
import org.ssafy.tmt.api.entity.account.Accounts;
import org.ssafy.tmt.api.entity.account.SavingAccount;
import org.ssafy.tmt.api.entity.account.SpendingAccount;
import org.ssafy.tmt.api.entity.saving.*;
import org.ssafy.tmt.api.entity.transaction.SavingTransaction;
import org.ssafy.tmt.api.entity.transaction.SpendingTransaction;
import org.ssafy.tmt.api.entity.user.Users;
import org.ssafy.tmt.api.repository.accounts.AccountsRepository;
import org.ssafy.tmt.api.repository.accounts.SavingAccountRepository;
import org.ssafy.tmt.api.repository.accounts.SpendingAccountRepository;
import org.ssafy.tmt.api.repository.saving.*;
import org.ssafy.tmt.api.repository.transaction.SavingTransactionRepository;
import org.ssafy.tmt.api.repository.transaction.SpendingTransactionRepository;
import org.ssafy.tmt.api.repository.users.UsersRepository;
import org.ssafy.tmt.api.response.MessageOnly;
import org.ssafy.tmt.api.service.saving.SavingService;
import org.ssafy.tmt.api.service.saving.SavingServiceImpl;
import org.ssafy.tmt.config.security.CustomUserDetails;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class DeleteSavingTest {

	@Mock private UsersRepository usersRepository;
	@Mock private AccountsRepository accountsRepository;
	@Mock private MoneyFlowRepository moneyFlowRepository;
	@Mock private SavingAccountRepository savingAccountRepository;
	@Mock private SpendingAccountRepository spendingAccountRepository;
	@Mock private SavingTransactionRepository savingTransactionRepository;
	@Mock private SavingOptionRepository savingOptionRepository;
	@Mock private AbsSavingRepository absSavingRepository;
	@Mock private SavingPercentRepository savingPercentRepository;
	@Mock private MaxMinRepository maxMinRepository;
	@Mock private SpendingTransactionRepository spendingTransactionRepository;

	// 지우는 순서 (abs or (savingPercent, maxMin)) -> SavingOption -> SavingTransaction -> MoneyFlow -> SavingAccount

	@InjectMocks
	private SavingServiceImpl savingServiceImpl;

	private SavingService savingService;

	@BeforeEach
	void setUp() {
		savingService = savingServiceImpl;
	}

	private Users createTestUser() {
		return Users.builder()
				.id(1)
				.name("test")
				.email("test@test.com")
				.password("test")
				.build();
	}

	private Accounts createTestAccount(Users user, String accountNumber, int id, long balance) {
		return Accounts.builder()
				.id(id)
				.user(user)
				.bank("국민은행")
				.balance(balance)
				.accountNumber(accountNumber)
				.build();
	}

	private CustomUserDetails createTestUserDetails(Users user) {
		return new CustomUserDetails(user.getId(), user.getName(), user.getEmail(), user.getPassword());
	}

	private SavingAccount createTestSavingAccount(Accounts accounts) {
		return SavingAccount.builder()
				.id(1)
				.accountNumber(accounts.getAccountNumber())
				.monthFines(0)
				.account(accounts)
				.createdAt(LocalDateTime.now())
				.misugeum(0)
				.updatedAt(LocalDateTime.now())
				.build();
	}

	private SpendingAccount createTestSpendingAccount(Accounts accounts) {
		return SpendingAccount.builder()
				.id(1)
				.accountNumber(accounts.getAccountNumber())
				.bank(accounts.getBank())
				.account(accounts)
				.createdAt(LocalDateTime.now())
				.isDeleted(false)
				.updatedAt(LocalDateTime.now())
				.name(accounts.getUser().getName())
				.build();
	}

	private SpendingTransaction createTestSpendingTransaction(SpendingAccount spendingAccount, SavingAccount savingAccount) {
		return SpendingTransaction.builder()
				.spendingAccount(spendingAccount)
				.savingAccount(savingAccount)
				.build();
	}

	private MoneyFlow createTestMoneyFlow(SavingAccount savingAccount, SpendingAccount spendingAccount) {
		return MoneyFlow.builder()
				.savingAccount(savingAccount)
				.spendingAccount(spendingAccount)
				.build();
	}

	private SavingOption createTestSavingOption(SavingAccount savingAccount, int savingType) {
		return SavingOption.builder()
				.savingAccount(savingAccount)
				.savingType(savingType)
				.build();
	}

	private AbsSaving createTestAbsSaving(SavingOption savingOption) {
		return AbsSaving.builder()
				.savingOption(savingOption)
				.build();
	}

	private SavingPercent createTestSavingPercent(SavingOption savingOption) {
		return SavingPercent.builder()
				.savingOption(savingOption)
				.build();
	}

	private SavingTransaction createTestSavingTransaction(SavingAccount savingAccount, SpendingAccount spendingAccount) {
		return SavingTransaction.builder()
				.savingAccount(savingAccount)
				.spendingAccount(spendingAccount)
				.build();
	}

	private MaxMin createTestMaxMin(SavingOption savingOption) {
		return MaxMin.builder()
				.savingOption( savingOption)
				.build();
	}

	// 공통 모킹 설정
	private void setupCommonMocks(Users user, SavingOption savingOption, String savingAccountNumber,
								  SavingAccount savingAccount, String spendingAccountNumber, SpendingAccount spendingAccount,
								  MoneyFlow moneyFlow, AbsSaving absSaving, SavingPercent savingPercent, MaxMin maxMin,
								  SavingTransaction savingTransaction, SpendingTransaction spendingTransaction) {
		when(usersRepository.findById(anyInt())).thenReturn(Optional.of(user));
		when(savingAccountRepository.findByAccountNumber(savingAccountNumber)).thenReturn(Optional.of(savingAccount));
		when(spendingAccountRepository.findByAccountNumber(spendingAccountNumber)).thenReturn(Optional.of(spendingAccount));
		when(moneyFlowRepository.findBySavingAccount(savingAccount)).thenReturn(List.of(moneyFlow));
		when(savingTransactionRepository.findBySavingAccount(savingAccount)).thenReturn(List.of(savingTransaction));
		when(savingOptionRepository.findBySavingAccount(savingAccount)).thenReturn(Optional.of(savingOption));
		when(absSavingRepository.findBySavingOption(savingOption)).thenReturn(List.of(absSaving));
		when(savingPercentRepository.findBySavingOption(savingOption)).thenReturn(List.of(savingPercent));
		when(maxMinRepository.findBySavingOption(savingOption)).thenReturn(Optional.of(maxMin));
		when(spendingTransactionRepository.findBySavingAccount(savingAccount)).thenReturn(List.of(spendingTransaction));
	}

	@Test
	void deleteSavingTest() {
		Users user = createTestUser();
		CustomUserDetails userDetails = createTestUserDetails(user);
		Accounts accounts1 = createTestAccount(user, "1234567", 1, 0);
		Accounts accounts2 = createTestAccount(user, "2345678", 2, 100000);
		SavingAccount savingAccount = createTestSavingAccount(accounts1);
		SpendingAccount spendingAccount = createTestSpendingAccount(accounts2);
		SavingTransaction savingTransaction = createTestSavingTransaction(savingAccount, spendingAccount);
		MoneyFlow moneyFlow = createTestMoneyFlow(savingAccount, spendingAccount);
		SavingOption savingOption = createTestSavingOption(savingAccount, 0);
		MaxMin maxMin = createTestMaxMin(savingOption);
		SavingPercent savingPercent = createTestSavingPercent(savingOption);
		AbsSaving absSaving = createTestAbsSaving(savingOption);
		PauseSavingDto pauseSavingDto = PauseSavingDto.builder()
				.savingAccountNumber(accounts1.getAccountNumber())
				.spendingAccountNumber(accounts2.getAccountNumber())
				.build();
		SpendingTransaction spendingTransaction = SpendingTransaction.builder()
				.savingAccount(savingAccount)
				.spendingAccount(spendingAccount)
				.build();

		setupCommonMocks(user, savingOption, accounts1.getAccountNumber(), savingAccount, accounts2.getAccountNumber(),
				spendingAccount, moneyFlow, absSaving, savingPercent, maxMin, savingTransaction, spendingTransaction);

		ResponseEntity<Object> response = savingService.deleteSaving(pauseSavingDto, userDetails);

		assertThat(response.getStatusCode().value())
				.as("HTTP 상태 코드는 200이어야 합니다.")
				.isEqualTo(200);
		MessageOnly messageOnly = (MessageOnly) response.getBody();
		assertThat(messageOnly.getMessage())
				.as("메시지는 'success'이어야 합니다.")
				.isEqualTo("success");

		verify(absSavingRepository, times(1)).deleteAll(List.of(absSaving));
		verify(savingPercentRepository, times(1)).deleteAll(List.of(savingPercent));
		verify(maxMinRepository, times(1)).delete(maxMin);
		verify(savingOptionRepository, times(1)).delete(savingOption);
		verify(savingTransactionRepository, times(1)).deleteAll(List.of(savingTransaction));
		verify(moneyFlowRepository, times(1)).deleteAll(List.of(moneyFlow));
		verify(savingAccountRepository, times(1)).delete(savingAccount);
	}
}
