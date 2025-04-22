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
import org.ssafy.tmt.api.entity.saving.MoneyFlow;
import org.ssafy.tmt.api.entity.user.Users;
import org.ssafy.tmt.api.repository.accounts.AccountsRepository;
import org.ssafy.tmt.api.repository.accounts.SavingAccountRepository;
import org.ssafy.tmt.api.repository.accounts.SpendingAccountRepository;
import org.ssafy.tmt.api.repository.saving.MoneyFlowRepository;
import org.ssafy.tmt.api.repository.users.UsersRepository;
import org.ssafy.tmt.api.response.MessageOnly;
import org.ssafy.tmt.api.service.saving.SavingService;
import org.ssafy.tmt.api.service.saving.SavingServiceImpl;
import org.ssafy.tmt.config.security.CustomUserDetails;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class PauseSavingTest {

	@Mock private UsersRepository usersRepository;
	@Mock private AccountsRepository accountsRepository;
	@Mock private MoneyFlowRepository moneyFlowRepository;
	@Mock private SavingAccountRepository savingAccountRepository;
	@Mock private SpendingAccountRepository spendingAccountRepository;

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

	private SavingAccount createTestSavingAccount( Accounts accounts, boolean pause) {
		return SavingAccount.builder()
				.id(1)
				.accountNumber(accounts.getAccountNumber())
				.monthFines(0)
				.account(accounts)
				.pause(pause)
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


	// 공통 모킹 설정
	private void setupCommonMocks(Users user, String savingAccountNumber, SavingAccount savingAccount, String spendingAccountNumber, SpendingAccount spendingAccount, MoneyFlow moneyFlow) {
		when(usersRepository.findById(anyInt())).thenReturn(Optional.of(user));
		when(savingAccountRepository.findByAccountNumber(savingAccountNumber)).thenReturn(Optional.of(savingAccount));
		when(spendingAccountRepository.findByAccountNumber(spendingAccountNumber)).thenReturn(Optional.of(spendingAccount));
		when(moneyFlowRepository.existsBySavingAccountAndSpendingAccount(savingAccount, spendingAccount)).thenReturn(true);
	}

	@Test
	void pauseSavingTest() {
		Users user = createTestUser();
		CustomUserDetails userDetails = createTestUserDetails(user);
		Accounts accounts1 = createTestAccount(user, "1234567", 1, 0);
		Accounts accounts2 = createTestAccount(user, "2345678", 2, 100000);
		SavingAccount savingAccount = createTestSavingAccount(accounts1, false);
		SpendingAccount spendingAccount = createTestSpendingAccount(accounts2);
		MoneyFlow moneyFlow = createTestMoneyFlow(savingAccount, spendingAccount);
		PauseSavingDto pauseSavingDto = PauseSavingDto.builder()
				.savingAccountNumber(accounts1.getAccountNumber())
				.spendingAccountNumber(accounts2.getAccountNumber())
				.build();

		setupCommonMocks(user, accounts1.getAccountNumber(), savingAccount, accounts2.getAccountNumber(), spendingAccount, moneyFlow);

		ResponseEntity<Object> response = savingService.pauseSaving(pauseSavingDto, userDetails);

		assertThat(response.getStatusCode().value())
				.as("HTTP 상태 코드는 200이어야 합니다.")
				.isEqualTo(200);
		MessageOnly messageOnly = (MessageOnly) response.getBody();
		assertThat(messageOnly.getMessage())
				.as("메시지는 'success'이어야 합니다.")
				.isEqualTo("success");
	}

	@Test
	void resumeSavingTest() {
		Users user = createTestUser();
		CustomUserDetails userDetails = createTestUserDetails(user);
		Accounts accounts1 = createTestAccount(user, "1234567", 1, 0);
		Accounts accounts2 = createTestAccount(user, "2345678", 2, 100000);
		SavingAccount savingAccount = createTestSavingAccount(accounts1, true);
		SpendingAccount spendingAccount = createTestSpendingAccount(accounts2);
		MoneyFlow moneyFlow = createTestMoneyFlow(savingAccount, spendingAccount);
		PauseSavingDto pauseSavingDto = PauseSavingDto.builder()
				.savingAccountNumber(accounts1.getAccountNumber())
				.spendingAccountNumber(accounts2.getAccountNumber())
				.build();

		setupCommonMocks(user, accounts1.getAccountNumber(), savingAccount, accounts2.getAccountNumber(), spendingAccount, moneyFlow);

		ResponseEntity<Object> response = savingService.resumeSaving(pauseSavingDto, userDetails);

		assertThat(response.getStatusCode().value())
				.as("HTTP 상태 코드는 200이어야 합니다.")
				.isEqualTo(200);
		MessageOnly messageOnly = (MessageOnly) response.getBody();
		assertThat(messageOnly.getMessage())
				.as("메시지는 'success'이어야 합니다.")
				.isEqualTo("success");
	}
}
