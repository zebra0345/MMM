package org.ssafy.tmt.saving;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;
import org.ssafy.tmt.api.dto.saving.GetSavingDto;
import org.ssafy.tmt.api.entity.account.Accounts;
import org.ssafy.tmt.api.entity.account.SavingAccount;
import org.ssafy.tmt.api.entity.account.SpendingAccount;
import org.ssafy.tmt.api.entity.saving.MoneyFlow;
import org.ssafy.tmt.api.entity.user.Users;
import org.ssafy.tmt.api.repository.accounts.AccountsRepository;
import org.ssafy.tmt.api.repository.accounts.SavingAccountRepository;
import org.ssafy.tmt.api.repository.accounts.SpendingAccountRepository;
import org.ssafy.tmt.api.repository.saving.MoneyFlowRepository;
import org.ssafy.tmt.api.repository.saving.SavingOptionRepository;
import org.ssafy.tmt.api.repository.saving.SavingPercentRepository;
import org.ssafy.tmt.api.repository.transaction.SavingTransactionRepository;
import org.ssafy.tmt.api.repository.transaction.SpendingTransactionRepository;
import org.ssafy.tmt.api.repository.users.UsersRepository;
import org.ssafy.tmt.api.service.saving.SavingService;
import org.ssafy.tmt.api.service.saving.SavingServiceImpl;
import org.ssafy.tmt.config.security.CustomUserDetails;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class GetSavingTest {

	@Mock
	private UsersRepository usersRepository;
	@Mock private AccountsRepository accountsRepository;
	@Mock private MoneyFlowRepository moneyFlowRepository;
	@Mock private SavingOptionRepository savingOptionRepository;
	@Mock private SavingPercentRepository savingPercentRepository;
	@Mock private SavingAccountRepository savingAccountRepository;
	@Mock private SpendingAccountRepository spendingAccountRepository;
	@Mock private SavingTransactionRepository savingTransactionRepository;
	@Mock private SpendingTransactionRepository spendingTransactionRepository;

	@InjectMocks
	private SavingServiceImpl savingServiceImpl;

	private SavingService savingService;

	@BeforeEach
	void setUp() {
		savingService = savingServiceImpl;
	}

	// 테스트용 사용자 생성
	private Users createTestUser() {
		return Users.builder()
				.id(1)
				.name("test")
				.email("test@test.com")
				.password("test")
				.build();
	}

	// 테스트용 계좌 생성
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
				.pause(false)
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

	private MoneyFlow createTestMoneyFlow(SavingAccount savingAccount, SpendingAccount spendingAccount) {
		return MoneyFlow.builder()
				.savingAccount(savingAccount)
				.spendingAccount(spendingAccount)
				.build();
	}

	private GetSavingDto createTestGetSavingDto(SavingAccount savingAccount, SpendingAccount spendingAccount) {
		return GetSavingDto.builder()
				.savingAccount(GetSavingDto.SavingAccountDto.builder()
						.accountNumber(savingAccount.getAccountNumber())
						.amount(savingAccount.getMonthFines())
						.balance(savingAccount.getAccount().getBalance())
						.pause(savingAccount.isPause())
						.bank(savingAccount.getAccount().getBank())
						.build())
				.build();
	}

	// 공통 모킹 설정
	private void setupCommonMocks(Users user, SavingAccount savingAccount, SpendingAccount spendingAccount, MoneyFlow moneyFlow) {
		when(usersRepository.findById(anyInt())).thenReturn(Optional.of(user));
		when(savingAccountRepository.findByUser(user)).thenReturn(Optional.of(savingAccount));
		when(moneyFlowRepository.findBySavingAccount(savingAccount)).thenReturn(List.of(moneyFlow));
	}

	@Test
	void getSavingTest() {
		Users user = createTestUser();
		CustomUserDetails userDetails = createTestUserDetails(user);
		Accounts accounts1 = createTestAccount(user, "1234567", 1, 0);
		Accounts accounts2 = createTestAccount(user, "2345678", 2, 100000);
		SavingAccount savingAccount = createTestSavingAccount( accounts1);
		SpendingAccount spendingAccount = createTestSpendingAccount(accounts2);
		MoneyFlow moneyFlow = createTestMoneyFlow(savingAccount, spendingAccount);
		GetSavingDto getSavingDto = createTestGetSavingDto(savingAccount, spendingAccount);
		List<GetSavingDto> getSavingDtoList = List.of(getSavingDto);

		setupCommonMocks(user, savingAccount, spendingAccount, moneyFlow);

		ResponseEntity<Object> response = savingService.getSaving(userDetails);

		// Assert
		assertThat(response.getStatusCode().value())
				.as("HTTP 상태 코드는 200이어야 합니다.")
				.isEqualTo(200);
		assertThat(response.getBody())
				.as("getSavingDto 에러")
				.usingRecursiveComparison()// 재귀적 비교 (객체 내부의 모든 필드를 비교하여 동등성 판단)
				.isEqualTo(getSavingDtoList);
	}
}
