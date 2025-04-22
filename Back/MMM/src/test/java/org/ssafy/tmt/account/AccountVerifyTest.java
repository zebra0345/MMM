package org.ssafy.tmt.account;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;
import org.ssafy.tmt.api.entity.account.AccountVerify;
import org.ssafy.tmt.api.entity.account.Accounts;
import org.ssafy.tmt.api.dto.account.AccountsBankAndNumber;
import org.ssafy.tmt.api.dto.account.AccountsRead;
import org.ssafy.tmt.api.entity.transaction.VerifyTransaction;
import org.ssafy.tmt.api.entity.user.Users;
import org.ssafy.tmt.api.repository.accounts.AccountVerifyRepository;
import org.ssafy.tmt.api.repository.accounts.AccountsRepository;
import org.ssafy.tmt.api.repository.users.UsersRepository;
import org.ssafy.tmt.api.repository.transaction.VerifyTransactionRepository;
import org.ssafy.tmt.api.response.MessageOnly;
import org.ssafy.tmt.api.service.account.AccountService;
import org.ssafy.tmt.api.service.account.AccountServiceImpl;
import org.ssafy.tmt.config.security.CustomUserDetails;
import org.ssafy.tmt.util.AccountsUtil;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class AccountVerifyTest {

	@Mock
	private AccountsRepository accountsRepository;

	@Mock
	private VerifyTransactionRepository verifyTransactionRepository;

	@Mock
	private AccountVerifyRepository accountVerifyRepository;

	@Mock
	private UsersRepository usersRepository;

	@Mock
	private AccountsUtil accountsUtil;

	@InjectMocks
	private AccountServiceImpl accountServiceImpl;

	// 인터페이스 타입으로 참조
	private AccountService accountService;

	@BeforeEach
	void setUp() {
		accountService = accountServiceImpl;
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
	private Accounts createTestAccount(Users user, String accountNumber, int id) {
		return Accounts.builder()
				.id(id)
				.user(user)
				.accountNumber(accountNumber)
				.build();
	}

	private CustomUserDetails createTestUserDetails(Users user) {
		return new CustomUserDetails(user.getId(), user.getName(), user.getEmail(), user.getPassword());
	}

	@Test
	@DisplayName("계좌 인증 요청 테스트 - 계좌가 존재하는 경우")
	void accountVerifyRequest_whenAccountExists() {
		// Arrange
		String accountNumber = "321432";
		// 빌더 패턴을 이용한 객체 생성
		Accounts account = Accounts.builder()
				.id(1)
				.build();

		// accountMapper가 해당 계좌번호에 대해 계좌를 반환하도록 설정
		when(accountsRepository.findByAccountNumber(accountNumber))
				.thenReturn(Optional.of(account));

		// Act
		ResponseEntity<Object> response = accountService.accountVerifyRequest(accountNumber);

		// Assert
		assertThat(response.getStatusCode().value())
				.as("HTTP 상태 코드는 200이어야 합니다.")
				.isEqualTo(200);
		Object body = response.getBody();
		assertThat(body)
				.as("응답 본문은 null이 아니어야 합니다.")
				.isNotNull();

		// MessageOnly로 캐스팅 후 getMessage() 호출
		MessageOnly messageOnly = (MessageOnly) body;
		assertThat(messageOnly.getMessage())
				.as("메시지는 'success'이어야 합니다.")
				.isEqualTo("success");

		// verifyTransactionMapper.insertVerifyTransaction()가 한 번 호출되었는지 검증
		verify(verifyTransactionRepository, times(1))
				.save(any(VerifyTransaction.class));

		// accountsUtil.updateAccountBalance()가 한 번 호출되었는지 검증
		verify(accountsUtil, times(1))
				.updateAccountBalance(any(Accounts.class), anyLong());
	}

	@Test
	@DisplayName("계좌 인증 요청 테스트 - 계좌가 존재하지 않는 경우")
	void accountVerifyRequest_whenAccountNotExists() {
		// Arrange
		String accountNumber = "321432";
		when(accountsRepository.findByAccountNumber(accountNumber))
				.thenReturn(Optional.empty());

		// Act
		ResponseEntity<Object> response = accountService.accountVerifyRequest(accountNumber);

		// Assert: 계좌가 없으므로 404 Not Found가 반환되어야 함
		assertThat(response.getStatusCode().value())
				.as("HTTP 상태 코드는 404여야 합니다.")
				.isEqualTo(404);
		Object body = response.getBody();
		assertThat(body)
				.as("응답 본문은 null이 아니어야 합니다.")
				.isNotNull();
		// MessageOnly로 캐스팅 후 getMessage() 호출
		MessageOnly messageOnly = (MessageOnly) body;
		assertThat(messageOnly.getMessage())
				.as("메시지는 '해당하는 계좌가 없습니다.'여야 합니다.")
				.isEqualTo("해당하는 계좌가 없습니다.");

		// verifyTransactionMapper.insertVerifyTransaction()가 호출되지 않았는지 검증
		verify(verifyTransactionRepository, never())
				.save(any(VerifyTransaction.class));

		// accountsUtil.updateAccountBalance()가 호출되지 않았는지 검증
		verify(accountsUtil, never())
				.updateAccountBalance(any(Accounts.class), anyLong());
	}

	@Test
	@DisplayName("계좌 인증 확인 - 인증 번호가 맞는 경우")
	void accountVerifyResponse_whenVerifyNumberExists() {
		// Arrange
		String accountNumber = "321432";
		String verifyNumber = "938279";
		// 빌더 패턴을 이용한 객체 생성
		Accounts account = Accounts.builder()
				.id(1)
				.accountNumber(accountNumber)
				.build();

		VerifyTransaction verifyTransaction = VerifyTransaction.builder()
				.id(1)
				.verifyNumber(verifyNumber)
				.account(account)
				.build();

		// VerifyTransactionMapper가 해당 거래내역에 대한 정보를 반환하도록 설정
		when(verifyTransactionRepository.findByAccountAndVerifyNumber(account, verifyNumber))
				.thenReturn(Optional.of(verifyTransaction));

		when(accountsRepository.findByAccountNumber(accountNumber))
				.thenReturn(Optional.of(account));

		// Act
		ResponseEntity<Object> response = accountService.accountVerifyResponse(accountNumber, verifyNumber);

		// Assert
		assertThat(response.getStatusCode().value())
				.as("HTTP 상태 코드는 200이어야 합니다.")
				.isEqualTo(200);
		Object body = response.getBody();
		assertThat(body)
				.as("응답 본문은 null이 아니어야 합니다.")
				.isNotNull();

		// MessageOnly로 캐스팅 후 getMessage() 호출
		MessageOnly messageOnly = (MessageOnly) body;
		assertThat(messageOnly.getMessage())
				.as("메시지는 'success'이어야 합니다.")
				.isEqualTo("success");
	}

	@Test
	@DisplayName("계좌 인증 확인 - 인증 번호가 틀린 경우")
	void accountVerifyResponse_whenVerifyNumberNotExists() {
		// Arrange
		String accountNumber = "321432";
		String verifyNumber = "938279";

		Accounts account = Accounts.builder()
				.id(1)
				.accountNumber(accountNumber)
				.build();

		// VerifyTransactionMapper가 해당 거래내역에 대한 정보를 반환하도록 설정
		when(verifyTransactionRepository.findByAccountAndVerifyNumber(account, verifyNumber))
				.thenReturn(Optional.empty());

		when(accountsRepository.findByAccountNumber(accountNumber))
				.thenReturn(Optional.of(account));

		// Act
		ResponseEntity<Object> response = accountService.accountVerifyResponse(accountNumber, verifyNumber);

		// Assert
		assertThat(response.getStatusCode().value())
				.as("HTTP 상태 코드는 404이어야 합니다.")
				.isEqualTo(404);
		Object body = response.getBody();
		assertThat(body)
				.as("응답 본문은 null이 아니어야 합니다.")
				.isNotNull();

		// MessageOnly로 캐스팅 후 getMessage() 호출
		MessageOnly messageOnly = (MessageOnly) body;
		assertThat(messageOnly.getMessage())
				.as("메시지는 '인증번호가 틀렸습니다.'이어야 합니다.")
				.isEqualTo("인증번호가 틀렸습니다.");
	}

	@Test
	@DisplayName("계좌 조회 - 계좌가 있을 경우")
	void accountRead_whenAccountsExists() {
		// 빌더 패턴을 이용한 객체 생성
		Users user = createTestUser();
		CustomUserDetails customUserDetails = createTestUserDetails(user);
		Accounts account = Accounts.builder()
				.id(1)
				.user(user)
				.accountNumber("1234567890")
				.bank("국민")
				.build();

		AccountsBankAndNumber accountsBankAndNumber = AccountsBankAndNumber.builder()
				.accountNumber(account.getAccountNumber())
				.bank(account.getBank())
				.build();

		// accountMapper가 해당 userId에 대해 계좌 목록을 반환하도록 설정 (비어있지 않은 리스트)
		when(accountsRepository.findAccountsBankAndNumberByUser(user))
				.thenReturn(List.of(accountsBankAndNumber));

		when(usersRepository.findById(anyInt()))
				.thenReturn(Optional.of(user));

		// Act
		ResponseEntity<Object> response = accountService.getAccounts(customUserDetails);

		// Assert
		assertThat(response.getStatusCode().value())
				.as("HTTP 상태 코드는 200이어야 합니다.")
				.isEqualTo(200);
		Object body = response.getBody();
		assertThat(body)
				.as("응답 본문은 null이 아니어야 합니다.")
				.isNotNull();

		AccountsRead accountsRead = (AccountsRead) body;
		assertThat(accountsRead.getMessage())
				.as("메시지는 'success'이어야 합니다.")
				.isEqualTo("success");
		assertThat(accountsRead.getAccounts())
				.as("계좌목록은 null이 아니어야 합니다.")
				.isNotNull();

		verify(accountsRepository, times(1))
				.findAccountsBankAndNumberByUser(any(Users.class));
	}

	@Test
	@DisplayName("계좌 조회 - 계좌가 없을 경우")
	void accountRead_whenAccountsNotExists() {
		Users user = createTestUser();
		CustomUserDetails customUserDetails = createTestUserDetails(user);

		// accountMapper가 해당 user에 대해 계좌 목록을 반환하도록 설정 (비어있지 않은 리스트)
		when(accountsRepository.findAccountsBankAndNumberByUser(user))
				.thenReturn(List.of());
		when(usersRepository.findById(anyInt()))
				.thenReturn(Optional.of(user));

		// Act
		ResponseEntity<Object> response = accountService.getAccounts(customUserDetails);

		// Assert
		assertThat(response.getStatusCode().value())
				.as("HTTP 상태 코드는 404이어야 합니다.")
				.isEqualTo(404);
		Object body = response.getBody();
		assertThat(body)
				.as("응답 본문은 null이 아니어야 합니다.")
				.isNotNull();

		MessageOnly messageOnly = (MessageOnly) body;
		assertThat(messageOnly.getMessage())
				.as("메시지는 '계좌가 없습니다.'이어야 합니다.")
				.isEqualTo("계좌가 없습니다.");

		verify(accountsRepository, times(1))
				.findAccountsBankAndNumberByUser(any(Users.class));
	}

	@Test
	@DisplayName("계좌 등록")
	void registerAccountTest() {
		// 빌더 패턴을 이용한 객체 생성
		Users user = createTestUser();
		CustomUserDetails customUserDetails = createTestUserDetails(user);

		Accounts account = Accounts.builder()
				.id(1)
				.user(user)
				.accountNumber("1234567890")
				.bank("국민")
				.build();

		AccountVerify accountVerify = AccountVerify.builder()
				.account(account)
				.verify(true)
				.build();

		// accountMapper가 해당 userId에 대해 계좌 목록을 반환하도록 설정 (비어있지 않은 리스트)
		when(accountsRepository.findByUser(any(Users.class)))
				.thenReturn(List.of(account));

		when(usersRepository.findById(anyInt()))
				.thenReturn(Optional.of(user));

		when(accountVerifyRepository.existsByAccount(any(Accounts.class)))
				.thenReturn(false);

		// Act
		ResponseEntity<Object> response = accountService.registerAccount(customUserDetails);

		// Assert
		assertThat(response.getStatusCode().value())
				.as("HTTP 상태 코드는 200이어야 합니다.")
				.isEqualTo(200);
		Object body = response.getBody();
		assertThat(body)
				.as("응답 본문은 null이 아니어야 합니다.")
				.isNotNull();

		MessageOnly messageOnly = (MessageOnly) body;
		assertThat(messageOnly.getMessage())
				.as("메시지는 'success'이어야 합니다.")
				.isEqualTo("success");

		verify(accountVerifyRepository, times(1))
				.save(any(AccountVerify.class));
	}
}
