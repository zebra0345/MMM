package org.ssafy.tmt.saving;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.ssafy.tmt.api.entity.account.Accounts;
import org.ssafy.tmt.api.entity.user.Users;
import org.ssafy.tmt.api.repository.accounts.AccountsRepository;
import org.ssafy.tmt.api.repository.accounts.SavingAccountRepository;
import org.ssafy.tmt.api.repository.accounts.SpendingAccountRepository;
import org.ssafy.tmt.api.repository.saving.*;
import org.ssafy.tmt.api.repository.transaction.SavingTransactionRepository;
import org.ssafy.tmt.api.repository.transaction.SpendingTransactionRepository;
import org.ssafy.tmt.api.repository.users.UsersRepository;
import org.ssafy.tmt.api.request.saving.SavingOptionRequest;
import org.ssafy.tmt.api.service.saving.SavingService;
import org.ssafy.tmt.api.service.saving.SavingServiceImpl;
import org.ssafy.tmt.config.security.CustomUserDetails;

import java.util.Optional;

import static org.mockito.Mockito.anyInt;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class SetSavingOptionTest {

	@Mock private SavingAccountRepository savingAccountRepository;
	@Mock private SpendingAccountRepository spendingAccountRepository;
	@Mock private SavingTransactionRepository savingTransactionRepository;
	@Mock private SpendingTransactionRepository spendingTransactionRepository;
	@Mock private LimitRepository limitRepository;
	@Mock private MaxLimitRepository maxLimitRepository;
	@Mock private MaxMinRepository maxMinRepository;
	@Mock private MoneyFlowRepository moneyFlowRepository;
	@Mock private SavingOptionRepository savingOptionRepository;
	@Mock private SavingPercentRepository savingPercentRepository;
	@Mock private SobiTagRepository sobiTagRepository;
	@Mock private TagLimitRepository tagLimitRepository;
	@Mock private AccountsRepository accountsRepository;
	@Mock private UsersRepository usersRepository;
	@Mock private AbsSavingRepository absSavingRepository;

	@InjectMocks
	private SavingServiceImpl savingServiceImpl;

	private SavingService savingService;

	@BeforeEach
	void setUp() {
		savingService = savingServiceImpl;
	}

	// 기본 SavingOptionRequest 생성
	private SavingOptionRequest createBaseRequest() {
		SavingOptionRequest request = new SavingOptionRequest();
		request.setSavingAccountNumber("321432");
		return request;
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

	// 공통 모킹 설정
	private void setupCommonMocks(SavingOptionRequest request, Users user, Accounts savingAcc, Accounts spendingAcc) {
		when(usersRepository.findById(anyInt()))
				.thenReturn(Optional.of(user));
		when(accountsRepository.findByAccountNumber(request.getSavingAccountNumber()))
				.thenReturn(Optional.of(savingAcc));
//		when(accountsRepository.findByAccountNumber(request.getSpendingAccountNumber()))
//				.thenReturn(Optional.of(spendingAcc));
		when(savingAccountRepository.existsByAccount(savingAcc)).thenReturn(false);
		when(savingAccountRepository.existsByAccount(spendingAcc)).thenReturn(false);
	}

//	@Test
//	@DisplayName("저축목표 및 기타 옵션 설정 - 강제저축, savingType 0 (절대저축)")
//	void setSavingOptionTest_withSavingType0() {
//		// Arrange
//		SavingOptionRequest request = createBaseRequest();
//		SavingOptionRequest.SavingTypeDto savingTypeDto = new SavingOptionRequest.SavingTypeDto();
//		savingTypeDto.setSavingType(0);
//		SavingOptionRequest.SavingTypeDto.AbsSavingDto absSaving = new SavingOptionRequest.SavingTypeDto.AbsSavingDto();
//		absSaving.setMaxAmount(500);
//		absSaving.setSavingAmount(300);
//		savingTypeDto.setAbsSaving(Collections.singletonList(absSaving));
//		request.setSavingType(savingTypeDto);
//
//		Users user = createTestUser();
//		CustomUserDetails customUserDetails = createTestUserDetails(user);
//		Accounts savingAcc = createTestAccount(user, request.getSavingAccountNumber(), 1);
//		Accounts spendingAcc = createTestAccount(user, request.getSpendingAccountNumber(), 2);
//
//		setupCommonMocks(request, user, savingAcc, spendingAcc);
//
//		// Act
//		ResponseEntity<Object> response = savingService.setSavingOption(request, customUserDetails);
//
//		// Assert
//		assertThat(response.getStatusCode().value())
//				.as("HTTP 상태 코드는 200이어야 합니다.")
//				.isEqualTo(200);
//		MessageOnly messageOnly = (MessageOnly) response.getBody();
//		assertThat(messageOnly.getMessage())
//				.as("메시지는 'success'이어야 합니다.")
//				.isEqualTo("success");
//
//		verify(spendingAccountRepository, times(1)).save(any(SpendingAccount.class));
//		verify(savingAccountRepository, times(1)).save(any(SavingAccount.class));
//		verify(moneyFlowRepository, times(1)).save(any(MoneyFlow.class));
//		verify(savingOptionRepository, times(1)).save(any(SavingOption.class));
//		verify(absSavingRepository, times(1)).save(any(AbsSaving.class));
//	}

//	@Test
//	@DisplayName("저축목표 및 기타 옵션 설정 - 강제저축, savingType 1 (비율저축)")
//	void setSavingOptionTest_withSavingType1() {
//		SobiTag sobiTag = SobiTag.builder()
//				.name("음식")
//				.build();
//
//		when(sobiTagRepository.findByName(anyString())).thenReturn(Optional.of(sobiTag));
//
//		// Arrange
//		SavingOptionRequest request = createBaseRequest();
//		SavingOptionRequest.SavingTypeDto savingTypeDto = new SavingOptionRequest.SavingTypeDto();
//		savingTypeDto.setSavingType(1);
//		SavingOptionRequest.SavingTypeDto.PerSavingDto perSaving = new SavingOptionRequest.SavingTypeDto.PerSavingDto();
//
//		// 비율 정보 설정
//		SavingOptionRequest.SavingTypeDto.SavingPercentDto savingPercent = new SavingOptionRequest.SavingTypeDto.SavingPercentDto();
//		savingPercent.setPercent(50);
//		savingPercent.setTag("Tag1");
//		perSaving.setSavingPercent(Collections.singletonList(savingPercent));
//
//		// 한도 정보 설정
//		SavingOptionRequest.SavingTypeDto.PerSavingDto.SavingMaxMinDto limits =
//				new SavingOptionRequest.SavingTypeDto.PerSavingDto.SavingMaxMinDto();
//		limits.setMaxAmount(800);
//		limits.setMinAmount(100);
//		perSaving.setMaxMin(limits);
//
//		savingTypeDto.setPerSaving(perSaving);
//		request.setSavingType(savingTypeDto);
//
//		Users user = createTestUser();
//		CustomUserDetails customUserDetails = createTestUserDetails(user);
//		Accounts savingAcc = createTestAccount(user, request.getSavingAccountNumber(), 1);
//		Accounts spendingAcc = createTestAccount(user, request.getSpendingAccountNumber(), 2);
//
//		setupCommonMocks(request, user, savingAcc, spendingAcc);
//
//		// Act
//		ResponseEntity<Object> response = savingService.setSavingOption(request, customUserDetails);
//
//		// Assert
//		assertThat(response.getStatusCode().value())
//				.as("HTTP 상태 코드는 200이어야 합니다.")
//				.isEqualTo(200);
//		MessageOnly messageOnly = (MessageOnly) response.getBody();
//		assertThat(messageOnly.getMessage())
//				.as("메시지는 'success'이어야 합니다.")
//				.isEqualTo("success");
//
//		verify(spendingAccountRepository, times(1)).save(any(SpendingAccount.class));
//		verify(savingAccountRepository, times(1)).save(any(SavingAccount.class));
//		verify(moneyFlowRepository, times(1)).save(any(MoneyFlow.class));
//		verify(savingOptionRepository, times(1)).save(any(SavingOption.class));
//		verify(maxMinRepository, times(1)).save(any(MaxMin.class));
//		verify(savingPercentRepository, times(1)).save(any(SavingPercent.class));
//	}
}
