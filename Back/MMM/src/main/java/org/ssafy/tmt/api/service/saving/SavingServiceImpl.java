package org.ssafy.tmt.api.service.saving;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.ssafy.tmt.api.dto.saving.AbsSavingDto;
import org.ssafy.tmt.api.dto.saving.GetSavingDto;
import org.ssafy.tmt.api.dto.saving.PauseSavingDto;
import org.ssafy.tmt.api.dto.saving.SavingPercentDetailDto;
import org.ssafy.tmt.api.dto.transaction.CalculatedSpendingTransactionDto;
import org.ssafy.tmt.api.entity.account.Accounts;
import org.ssafy.tmt.api.entity.account.SavingAccount;
import org.ssafy.tmt.api.entity.account.SpendingAccount;
import org.ssafy.tmt.api.entity.chat.ChatRoom;
import org.ssafy.tmt.api.entity.saving.*;
import org.ssafy.tmt.api.entity.spending.FixedExpense;
import org.ssafy.tmt.api.entity.transaction.SavingTransaction;
import org.ssafy.tmt.api.entity.transaction.SpendingTransaction;
import org.ssafy.tmt.api.entity.user.Users;
import org.ssafy.tmt.api.repository.accounts.AccountsRepository;
import org.ssafy.tmt.api.repository.accounts.SavingAccountRepository;
import org.ssafy.tmt.api.repository.accounts.SpendingAccountRepository;
import org.ssafy.tmt.api.repository.chat.ChatRoomRepository;
import org.ssafy.tmt.api.repository.saving.*;
import org.ssafy.tmt.api.repository.spending.FixedExpenseRepository;
import org.ssafy.tmt.api.repository.transaction.SavingTransactionRepository;
import org.ssafy.tmt.api.repository.transaction.SpendingTransactionRepository;
import org.ssafy.tmt.api.repository.users.UsersRepository;
import org.ssafy.tmt.api.request.fcm.FcmRequestDto;
import org.ssafy.tmt.api.request.saving.AbsSavingUpdateRequestDto;
import org.ssafy.tmt.api.request.saving.SavingOptionRequest;
import org.ssafy.tmt.api.request.saving.SavingPercentUpdateDto;
import org.ssafy.tmt.api.response.saving.SavingDetail;
import org.ssafy.tmt.api.response.saving.TestPageDto;
import org.ssafy.tmt.api.service.chat.ChatService;
import org.ssafy.tmt.api.service.fcm.FcmService;
import org.ssafy.tmt.config.security.CustomUserDetails;
import org.ssafy.tmt.util.MessageUtil;
import org.ssafy.tmt.util.Response;
import org.ssafy.tmt.util.SavingCalculator;

import java.io.IOException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;

@Service
@Slf4j
@RequiredArgsConstructor
public class SavingServiceImpl implements SavingService {

	// Repository 및 서비스 의존성 주입
	private final UsersRepository usersRepository;
	private final AccountsRepository accountsRepository;
	private final SavingAccountRepository savingAccountRepository;
	private final SpendingAccountRepository spendingAccountRepository;
	private final SavingOptionRepository savingOptionRepository;
	private final AbsSavingRepository absSavingRepository;
	private final MoneyFlowRepository moneyFlowRepository;
	private final MaxMinRepository maxMinRepository;
	private final SobiTagRepository sobiTagRepository;
	private final SavingPercentRepository savingPercentRepository;
	private final SavingTransactionRepository savingTransactionRepository;
	private final SpendingTransactionRepository spendingTransactionRepository;
	private final ChatService chatService;
	private final CumulativeFineRepository cumulativeFineRepository;
	private final FcmService fcmService;
	private final ChatRoomRepository chatRoomRepository;
	private final FixedExpenseRepository fixedExpenseRepository;

	/**
	 * 저축 옵션을 설정하는 메서드
	 * 사용자와 계좌 존재 여부, 중복 등록 여부를 확인 후,
	 * 각종 저장소에 저축 관련 엔티티들을 저장한다.
	 */
	@Override
	@Transactional
	public ResponseEntity<Object> setSavingOption(SavingOptionRequest savingOptionRequest, CustomUserDetails customUserDetails) {
		// 사용자 정보 조회
		Optional<Users> user = usersRepository.findById(customUserDetails.getId());
		if (user.isEmpty()) {
			return Response.Response(HttpStatus.NOT_FOUND, MessageUtil.buildMessage("아이디가 없습니다."));
		}

		// 사용자 소유의 계좌 조회
		List<Accounts> accounts = accountsRepository.findByUser(user.get());
		String savingAccountNumber = savingOptionRequest.getSavingAccountNumber();

		// 지정한 계좌 번호의 계좌 존재 여부 확인
		Optional<Accounts> savingAccount = accountsRepository.findByAccountNumber(savingAccountNumber);
		if (savingAccount.isEmpty()) {
			return Response.Response(HttpStatus.NOT_FOUND, MessageUtil.buildMessage("계좌가 없습니다."));
		}

		// 이미 저축 계좌가 등록되어 있는 경우 처리
		if (savingAccountRepository.existsByUser(user.get())) {
			return Response.Response(HttpStatus.CONFLICT, MessageUtil.buildMessage("이미 벌금 계좌가 등록돼 있습니다."));
		}

		// SavingAccount 엔티티 생성 및 저장
		SavingAccount savingAccount1 = SavingAccount.builder()
				.user(user.get())
				.account(savingAccount.get())
				.accountNumber(savingAccountNumber)
				.monthFines(0)
				.pause(false)
				.build();
		savingAccountRepository.save(savingAccount1);

		// CumulativeFines 엔티티 생성 및 저장 (누적 벌금 초기화)
		CumulativeFines cumulativeFines = CumulativeFines.builder()
				.savingAccount(savingAccount1)
				.cumulativeFines(0)
				.build();
		cumulativeFineRepository.save(cumulativeFines);

		// 사용자의 다른 계좌들에 대해 SpendingAccount 및 MoneyFlow 생성
		for (Accounts account : accounts) {
			if (account.getAccountNumber().equals(savingAccount.get().getAccountNumber())) {
				continue;
			}
			SpendingAccount spendingAccount1 = SpendingAccount.builder()
					.account(account)
					.name(user.get().getName())
					.accountNumber(account.getAccountNumber())
					.bank(account.getBank())
					.build();
			spendingAccountRepository.save(spendingAccount1);

			MoneyFlow moneyFlow = MoneyFlow.builder()
					.savingAccount(savingAccount1)
					.spendingAccount(spendingAccount1)
					.user(user.get())
					.build();
			moneyFlowRepository.save(moneyFlow);
		}

		// SavingOption 엔티티 생성 및 저장 (저축 옵션 설정)
		SavingOption savingOption = SavingOption.builder()
				.savingAccount(savingAccount1)
				.savingType(savingOptionRequest.getSavingType().getSavingType())
				.build();
		savingOptionRepository.save(savingOption);

		// 절대값 기반 저축 옵션일 경우
		if (savingOption.getSavingType() == 0) {
			for (SavingOptionRequest.SavingTypeDto.AbsSavingDto absSavingDto : savingOptionRequest.getSavingType().getAbsSaving()) {
				AbsSaving absSaving = AbsSaving.builder()
						.savingOption(savingOption)
						.savingAmount(absSavingDto.getSavingAmount())
						.maxAmount(absSavingDto.getMaxAmount())
						.active(absSavingDto.isActive())
						.build();
				absSavingRepository.save(absSaving);
			}
		}
		// 퍼센트 기반 저축 옵션일 경우
		else if (savingOption.getSavingType() == 1) {
			// 최대/최소 한도 설정
			SavingOptionRequest.SavingTypeDto.PerSavingDto.SavingMaxMinDto maxMinDto = savingOptionRequest.getSavingType().getPerSaving().getMaxMin();
			MaxMin.MaxMinBuilder maxMinbuilder = MaxMin.builder().savingOption(savingOption);
			Optional.ofNullable(maxMinDto.getMaxAmount()).ifPresent(maxMinbuilder::maxAmount);
			Optional.ofNullable(maxMinDto.getMinAmount()).ifPresent(maxMinbuilder::minAmount);
			MaxMin maxMin = maxMinbuilder.build();
			maxMinRepository.save(maxMin);

			// 각 소비 태그별 저축 퍼센트 저장
			for (SavingOptionRequest.SavingTypeDto.SavingPercentDto savingPercentDto : savingOptionRequest.getSavingType().getPerSaving().getSavingPercent()) {
				Optional<SobiTag> sobiTags = sobiTagRepository.findByName(savingPercentDto.getTag());
				if (sobiTags.isEmpty()) {
					return Response.Response(HttpStatus.NOT_FOUND, MessageUtil.buildMessage("소비태그가 없습니다."));
				}
				SobiTag sobiTag = sobiTags.get();
				SavingPercent savingPercent = SavingPercent.builder()
						.savingOption(savingOption)
						.sobiTag(sobiTag)
						.percent(savingPercentDto.getPercent())
						.build();
				savingPercentRepository.save(savingPercent);
			}
		} else {
			// 올바르지 않은 저축 방식 처리
			return Response.Response(HttpStatus.BAD_REQUEST, MessageUtil.buildMessage("잘못된 저축방식입니다."));
		}

		return Response.Response(HttpStatus.OK, MessageUtil.buildMessage("success"));
	}

	/**
	 * 강제 저축 실행 메서드 (스케줄러에 의해 주기적으로 실행)
	 */
	@Override
	@Scheduled(cron = "${saving.forced.cron:00 00 23 * * *}")
	@Transactional
	public void forcedSaving() throws IOException {
		// 현재 시간 및 기준 시간 설정
		LocalDateTime now = LocalDateTime.now();
//      LocalDateTime now = LocalDateTime.of(2025, 3, 26, 23, 00);
		LocalDateTime todayAt105959 = now.withHour(22).withMinute(59).withSecond(59).withNano(0);
		LocalDateTime yesterdayAt230000 = now.minusDays(1).withHour(23).withMinute(0).withSecond(0).withNano(0);

		// 전체 MoneyFlow 목록 조회
		List<MoneyFlow> moneyFlows = moneyFlowRepository.findAll();
		List<MoneyFlow> forcedSavingMoneyFlows = new ArrayList<>();
		// 기준 시간 내의 지출 거래 내역 조회
		List<SpendingTransaction> allSpendingTransactions = spendingTransactionRepository.findByCreatedAtBetween(yesterdayAt230000, todayAt105959);

		// 강제저축 관련 인덱스 및 임시 맵 생성
		Map<Integer, Integer> forcedIdxMap = new HashMap<>();
		Map<Integer, List<AbsSaving>> absSavingMap = new HashMap<>();
		Map<Integer, Map<String, Integer>> savingPercentMap = new HashMap<>();
		Map<Integer, MaxMin> maxMinMap = new HashMap<>();
		Map<Integer, Long> totalBalanceMap = new HashMap<>();

		// 보낼 알림 저장
		Map<Integer, FcmRequestDto> fcmRequestDtoMap = new HashMap<>();

		System.out.println("moneyFlows: " + moneyFlows.size());
		for (SpendingTransaction spendingTransaction : allSpendingTransactions) {
			System.out.println("출금 내역 : " + spendingTransaction.toString());
		}

		int forcedIdx = 0;
		// 일시정지되지 않은 저축 계좌에 대해 강제저축 대상 MoneyFlow 목록 생성
		for (MoneyFlow moneyFlow : moneyFlows) {
			SavingAccount savingAccount = moneyFlow.getSavingAccount();
			if (!savingAccount.isPause()) {
				forcedSavingMoneyFlows.add(moneyFlow);
				forcedIdxMap.put(moneyFlow.getSpendingAccount().getId(), forcedIdx);
				forcedIdx++;
			}
		}

		// 각 지출 거래에 대해 해당하는 강제저축 금액 계산 (절대값/퍼센트에 따라 분기)
		for (SpendingTransaction spendingTransaction : allSpendingTransactions) {
			Integer forcedIdxValue = forcedIdxMap.get(spendingTransaction.getSpendingAccount().getId());
			if (forcedIdxMap.get(spendingTransaction.getSpendingAccount().getId()) == null) continue;
			MoneyFlow forcedMoneyflow = forcedSavingMoneyFlows.get(forcedIdxValue);
			SpendingAccount forcedSpendingAccount = spendingTransaction.getSpendingAccount();
			SavingAccount forcedSavingAccount = forcedMoneyflow.getSavingAccount();
			Optional<SavingOption> savingOption = savingOptionRepository.findBySavingAccount(forcedSavingAccount);
			if (savingOption.isEmpty()) continue;
			if (spendingTransaction.getCategory().equals("MMM")) continue;

			switch (savingOption.get().getSavingType()) {
				// 절대값 기반 저축
				case 0:
					log.debug("실행1");
					List<AbsSaving> absSavings;
					if (absSavingMap.containsKey(forcedSavingAccount.getId())) {
						absSavings = absSavingMap.get(forcedSavingAccount.getId());
					} else {
						absSavings = absSavingRepository.findBySavingOption(savingOption.get());
						absSavings.sort(Comparator.comparingInt(AbsSaving::getMaxAmount));
						absSavingMap.put(forcedSavingAccount.getId(), absSavings);
					}
					if (totalBalanceMap.containsKey(forcedSavingAccount.getId())) {
						long newTotalBalance = totalBalanceMap.get(forcedSavingAccount.getId()) + absSave(absSavings, spendingTransaction);
						totalBalanceMap.put(forcedSavingAccount.getId(), newTotalBalance);
					} else {
						totalBalanceMap.put(forcedSavingAccount.getId(), absSave(absSavings, spendingTransaction));
					}
					break;
				// 퍼센트 기반 저축
				case 1:
					log.debug("실행1");
					Map<String, Integer> savingPercents = new HashMap<>();
					MaxMin maxMin;
					if (savingPercentMap.containsKey(forcedSavingAccount.getId())) {
						savingPercents = savingPercentMap.get(forcedSavingAccount.getId());
					} else {
						List<SavingPercent> savingPercentList = savingPercentRepository.findBySavingOption(savingOption.get());
						for (SavingPercent sp : savingPercentList) {
							savingPercents.put(sp.getSobiTag().getName(), sp.getPercent());
						}
						savingPercentMap.put(forcedSavingAccount.getId(), savingPercents);
					}
					if (maxMinMap.containsKey(forcedSavingAccount.getId())) {
						maxMin = maxMinMap.get(forcedSavingAccount.getId());
					} else {
						maxMin = maxMinRepository.findBySavingOption(savingOption.get()).get();
						maxMinMap.put(forcedSavingAccount.getId(), maxMin);
					}
					if (totalBalanceMap.containsKey(forcedSavingAccount.getId())) {
						long newTotalBalance = totalBalanceMap.get(forcedSavingAccount.getId()) + perSave(savingPercents, maxMin, spendingTransaction);
						totalBalanceMap.put(forcedSavingAccount.getId(), newTotalBalance);
					} else {
						totalBalanceMap.put(forcedSavingAccount.getId(), perSave(savingPercents, maxMin, spendingTransaction));
					}
					log.debug("더한 금액 : " + totalBalanceMap.get(forcedSavingAccount.getId()));
					break;
			}
		}

		log.debug("실행2");

		// 각 MoneyFlow에 대해 최종 강제저축 처리를 진행
		for (MoneyFlow moneyFlow : forcedSavingMoneyFlows) {
			log.debug("실행3 : " + moneyFlow.toString());
			SpendingAccount forcedSpendingAccount = moneyFlow.getSpendingAccount();
			SavingAccount forcedSavingAccount = moneyFlow.getSavingAccount();
			Long total = totalBalanceMap.get(forcedSavingAccount.getId());
			log.debug("실행3-1");
			if (totalBalanceMap.get(forcedSavingAccount.getId()) == null) continue;
			total += forcedSavingAccount.getMisugeum();
			long postBalance = forcedSpendingAccount.getAccount().getBalance() - total;

			Optional<CumulativeFines> cumulativeFinesOptional = cumulativeFineRepository.findBySavingAccount(forcedSavingAccount);
			log.debug("실행3-2" + forcedSavingAccount.getAccountNumber());
			if (cumulativeFinesOptional.isEmpty()) continue;
			CumulativeFines cumulativeFine = cumulativeFinesOptional.get();

			log.debug("postBalance : " + postBalance);

			// 이전 monthFines
			long oldMonthFines = forcedSavingAccount.getMonthFines();

			// 출금 후 잔액이 음수인 경우 (모든 금액 인출)
			if (postBalance < 0) {
				log.debug("실행 4" + forcedSavingAccount.getUser());
				SpendingTransaction spendingTransaction = SpendingTransaction.builder()
						.spendingAccount(forcedSpendingAccount)
						.savingAccount(forcedSavingAccount)
						.amount(forcedSpendingAccount.getAccount().getBalance())
						.item("MMM")
						.category("MMM")
						.user(forcedSavingAccount.getUser())
						.build();

				SavingTransaction savingTransaction = SavingTransaction.builder()
						.savingAccount(forcedSavingAccount)
						.spendingAccount(forcedSpendingAccount)
						.amount(forcedSpendingAccount.getAccount().getBalance())
						.build();

				forcedSavingAccount.getAccount().updateBalance(forcedSavingAccount.getAccount().getBalance() + forcedSpendingAccount.getAccount().getBalance());
				forcedSavingAccount.updateAmount(forcedSavingAccount.getAccount().getBalance() + forcedSpendingAccount.getAccount().getBalance());
				forcedSavingAccount.updateMisugeum((-1 * postBalance));
				forcedSpendingAccount.getAccount().updateBalance(0);
				cumulativeFine.updateCumulativeFines(forcedSpendingAccount.getAccount().getBalance());
				spendingTransactionRepository.save(spendingTransaction);
				savingTransactionRepository.save(savingTransaction);
			} else { // 잔액이 남는 경우
				log.debug("실행 4{}", forcedSavingAccount.getUser());
				SpendingTransaction spendingTransaction = SpendingTransaction.builder()
						.spendingAccount(forcedSpendingAccount)
						.savingAccount(forcedSavingAccount)
						.amount(total)
						.item("MMM")
						.category("MMM")
						.user(forcedSavingAccount.getUser())
						.build();

				SavingTransaction savingTransaction = SavingTransaction.builder()
						.savingAccount(forcedSavingAccount)
						.spendingAccount(forcedSpendingAccount)
						.amount(total)
						.build();

				log.debug("여기까지 왔나?");

				forcedSavingAccount.getAccount().updateBalance(forcedSavingAccount.getAccount().getBalance() + total);
				forcedSavingAccount.updateAmount(forcedSavingAccount.getMonthFines() + total);
				System.out.println("확인용 : " + cumulativeFine.getCumulativeFines());
				System.out.println("토탈 : " + total);
				cumulativeFine.updateCumulativeFines(total);
				System.out.println("확인용2 : " + cumulativeFine.getCumulativeFines());
				forcedSavingAccount.updateMisugeum(0);
				forcedSpendingAccount.getAccount().updateBalance(postBalance);
				spendingTransactionRepository.save(spendingTransaction);
				savingTransactionRepository.save(savingTransaction);
			}
			// 나중에 미수금 알림, 완료 알림 등의 로직을 추가할 수 있음
			log.debug("실행5");

			long newMonthFines = forcedSavingAccount.getMonthFines();
			// 50,000원 단위 단계를 계산
			long oldStep = oldMonthFines / 50000;
			long newStep = newMonthFines / 50000;

			// 단계가 올라갔다면, 각 단계마다 알림 전송
			if (newStep > oldStep) {
				FcmRequestDto fcmRequestDto = FcmRequestDto.builder()
						.title("경고!")
						.body("이번달 벌금이 " + (newStep * 50000) + "원을 넘었습니다!")
						.warn(true)
						.build();
				fcmRequestDtoMap.put(moneyFlow.getUser().getId(), fcmRequestDto);
			} else if (!fcmRequestDtoMap.containsKey(moneyFlow.getUser().getId())) {
				FcmRequestDto fcmRequestDto = FcmRequestDto.builder()
						.title("벌금이 정산됐습니다.")
						.body("이번달 벌금이 정산됐습니다. 들어와서 확인해보세요!")
						.warn(false)
						.build();
				fcmRequestDtoMap.put(moneyFlow.getUser().getId(), fcmRequestDto);
			}
		}
		log.debug("실행6");
		// map으로 저장해둔 메시지들 forEach로 메시지 보내기
		fcmRequestDtoMap.forEach((k, v) -> {
			try {
				Optional<Users> user = usersRepository.findById(k);
				if (user.isPresent()) fcmService.sendMessageTo(v, user.get());
			} catch (IOException e) {
				log.error("FCM 전송 실패: userId={}, dto={}", k, v, e);
			}
		});
	}

	// 절대값 기반 저축 계산을 위한 도우미 메서드
	private long absSave(List<AbsSaving> absSavings, SpendingTransaction spendingTransaction) {
		return SavingCalculator.absSave(absSavings, spendingTransaction);
	}

	// 퍼센트 기반 저축 계산을 위한 도우미 메서드
	private long perSave(Map<String, Integer> savingPercentMap, MaxMin maxMin, SpendingTransaction spendingTransaction) {
		Integer maxAmount = maxMin.getMaxAmount();
		Integer minAmount = maxMin.getMinAmount();
		long total = 0;

		if (spendingTransaction.getCategory().equals("MMM")) {
			return 0;
		} else if (savingPercentMap.containsKey(spendingTransaction.getCategory())) {
			long percent = savingPercentMap.get(spendingTransaction.getCategory());
			long amount = spendingTransaction.getAmount();
			long saving = amount * percent / 100;

			if (maxAmount != null && saving > maxAmount) {
				saving = maxAmount;
			} else if (minAmount != null && saving < minAmount) {
				saving = minAmount;
			}
			total += saving;
		} else {
			long amount = spendingTransaction.getAmount();
			long saving = amount * 10 / 100;
			total += saving;
		}

		return total;
	}

	/**
	 * 저축 정보를 조회하는 메서드
	 */
	@Override
	@Transactional
	public ResponseEntity<Object> getSaving(CustomUserDetails customUserDetails) {
		// 사용자 정보 조회
		Optional<Users> user = usersRepository.findById(customUserDetails.getId());
		if (user.isEmpty()) {
			return Response.Response(HttpStatus.NOT_FOUND, MessageUtil.buildMessage("아이디가 없습니다."));
		}

		// 사용자에 해당하는 저축 계좌 조회
		Optional<SavingAccount> savingAccountOptional = savingAccountRepository.findByUser(user.get());
		GetSavingDto getSavingDto = null;

		if (savingAccountOptional.isPresent()) {
			SavingAccount savingAccount = savingAccountOptional.get();
			// 누적 벌금 정보 조회
			Optional<CumulativeFines> cumulativeFinesOptional = cumulativeFineRepository.findBySavingAccount(savingAccount);
			if (cumulativeFinesOptional.isEmpty()) {
				return Response.Response(HttpStatus.NOT_FOUND, MessageUtil.buildMessage("누적 벌금 테이블이 없습니다."));
			}
			CumulativeFines cumulativeFines = cumulativeFinesOptional.get();

			// 저축 옵션 정보 조회
			Optional<SavingOption> savingOptionOptional = savingOptionRepository.findBySavingAccount(savingAccount);
			if (savingOptionOptional.isEmpty()) {
				return Response.Response(HttpStatus.NOT_FOUND, MessageUtil.buildMessage("벌금 옵션이 없습니다."));
			}
			SavingOption savingOption = savingOptionOptional.get();
			// 지출 거래 내역 조회
			List<SpendingTransaction> spendingTransactions = getSpendingTransactions(user.get());
			long daily = 0;

			// 저축 방식에 따라 일별 저축 금액 계산
			switch (savingOption.getSavingType()) {
				case 0:
					List<AbsSaving> absSavingList = absSavingRepository.findBySavingOption(savingOption);
					for (SpendingTransaction spendingTransaction : spendingTransactions) {
						daily += absSave(absSavingList, spendingTransaction);
					}
					break;
				case 1:
					List<SavingPercent> savingPercentList = savingPercentRepository.findBySavingOption(savingOption);
					Optional<MaxMin> maxMinOptional = maxMinRepository.findBySavingOption(savingOption);
					Map<String, Integer> savingPercents = new HashMap<>();

					if (maxMinOptional.isEmpty()) {
						return Response.Response(HttpStatus.NOT_FOUND, MessageUtil.buildMessage("maxmin이 없습니다."));
					}
					for (SavingPercent sp : savingPercentList) {
						savingPercents.put(sp.getSobiTag().getName(), sp.getPercent());
					}
					for (SpendingTransaction spendingTransaction : spendingTransactions) {
						daily += perSave(savingPercents, maxMinOptional.get(), spendingTransaction);
					}
					break;
			}

			// DTO 생성 후 반환
			getSavingDto = createGetSavingDto(savingAccount, cumulativeFines.getCumulativeFines(), daily);
		}

		return Response.Response(HttpStatus.OK, getSavingDto);
	}

	// 사용자의 지출 거래 내역 조회 (하루 23시 기준)
	private List<SpendingTransaction> getSpendingTransactions(Users user) {
		LocalDateTime now = LocalDateTime.now();
		LocalDateTime today23 = LocalDate.now().atTime(23, 0);
		// 오늘 23시 이전이면, 전날 23시부터 현재까지 조회
		LocalDateTime yesterday23 = LocalDate.now().minusDays(1).atTime(23, 0);

		if (now.isAfter(today23)) {
			return spendingTransactionRepository.findByUserAndCreatedAtBetween(user, today23, now);
		} else {
			return spendingTransactionRepository.findByUserAndCreatedAtBetween(user, yesterday23, now);
		}
	}

	// GetSavingDto 객체 생성 메서드
	private GetSavingDto createGetSavingDto(SavingAccount savingAccount, long cumulativeFine, long daily) {
		return GetSavingDto.builder()
				.savingAccount(GetSavingDto.SavingAccountDto.builder()
						.savingAccountId(savingAccount.getId())
						.accountNumber(savingAccount.getAccountNumber())
						.amount(savingAccount.getMonthFines())
						.balance(savingAccount.getAccount().getBalance())
						.pause(savingAccount.isPause())
						.bank(savingAccount.getAccount().getBank())
						.build())
				.cumulativeFines(cumulativeFine)
				.daily(daily)
				.build();
	}

	/**
	 * 저축 일시정지 처리 메서드
	 */
	@Override
	@Transactional
	public ResponseEntity<Object> pauseSaving(PauseSavingDto pauseSavingDto, CustomUserDetails customUserDetails) {
		// 사용자 확인
		Optional<Users> users = usersRepository.findById(customUserDetails.getId());
		if (users.isEmpty()) {
			return Response.Response(HttpStatus.NOT_FOUND, MessageUtil.buildMessage("아이디가 없습니다."));
		}
		Users user = users.get();

		// 저축 및 소비 계좌 조회
		SavingAccount savingAccount = null;
		Optional<SavingAccount> savingAccountOptional = savingAccountRepository.findByAccountNumber(pauseSavingDto.getSavingAccountNumber());
		if (savingAccountOptional.isEmpty()) {
			return Response.Response(HttpStatus.NOT_FOUND, MessageUtil.buildMessage("계좌가 존재하지 않습니다."));
		}

		savingAccount = savingAccountOptional.get();

		// 다른 사용자 계좌일 경우 처리
		if (!savingAccount.getAccount().getUser().equals(user)) {
			return Response.Response(HttpStatus.NOT_FOUND, MessageUtil.buildMessage("다른 계정의 계좌입니다.."));
		}

		// 이미 일시정지 상태인지 확인
		if (savingAccount.isPause()) {
			return Response.Response(HttpStatus.BAD_REQUEST, MessageUtil.buildMessage("이미 일시정지된 저축입니다."));
		}

		savingAccount.updatePause(true);

		return Response.Response(HttpStatus.OK, MessageUtil.buildMessage("success"));
	}

	/**
	 * 저축 일시정지 해제(재개) 메서드
	 */
	@Override
	@Transactional
	public ResponseEntity<Object> resumeSaving(PauseSavingDto pauseSavingDto, CustomUserDetails customUserDetails) {
		// 사용자 확인
		Optional<Users> users = usersRepository.findById(customUserDetails.getId());
		if (users.isEmpty()) {
			return Response.Response(HttpStatus.NOT_FOUND, MessageUtil.buildMessage("아이디가 없습니다."));
		}
		Users user = users.get();

		// 저축 및 소비 계좌 조회
		SavingAccount savingAccount = null;

		Optional<SavingAccount> savingAccountOptional = savingAccountRepository.findByAccountNumber(pauseSavingDto.getSavingAccountNumber());
		if (savingAccountOptional.isEmpty()) {
			return Response.Response(HttpStatus.NOT_FOUND, MessageUtil.buildMessage("계좌가 존재하지 않습니다."));
		}

		savingAccount = savingAccountOptional.get();


		// 다른 사용자 계좌일 경우 처리
		if (!savingAccount.getAccount().getUser().equals(user)) {
			return Response.Response(HttpStatus.NOT_FOUND, MessageUtil.buildMessage("다른 계정의 계좌입니다.."));
		}

		// 이미 일시정지 해제 상태인 경우 처리
		if (!savingAccount.isPause()) {
			return Response.Response(HttpStatus.BAD_REQUEST, MessageUtil.buildMessage("일시정지되지 않은 저축입니다."));
		}

		savingAccount.updatePause(false);

		return Response.Response(HttpStatus.OK, MessageUtil.buildMessage("success"));
	}

	/**
	 * 저축 삭제 처리 메서드
	 */
	@Override
	@Transactional
	public ResponseEntity<Object> deleteSaving(PauseSavingDto pauseSavingDto, CustomUserDetails customUserDetails) {
		// 사용자 확인
		Optional<Users> users = usersRepository.findById(customUserDetails.getId());
		if (users.isEmpty()) {
			return Response.Response(HttpStatus.NOT_FOUND, MessageUtil.buildMessage("아이디가 없습니다."));
		}
		Users user = users.get();

		SavingAccount savingAccount = null;
		MaxMin maxMin = null;

		// 저축 및 소비 계좌 조회
		Optional<SavingAccount> savingAccountOptional = savingAccountRepository.findByAccountNumber(pauseSavingDto.getSavingAccountNumber());
		if (savingAccountOptional.isEmpty()) {
			return Response.Response(HttpStatus.NOT_FOUND, MessageUtil.buildMessage("계좌가 존재하지 않습니다."));
		}

		savingAccount = savingAccountOptional.get();

		// 다른 사용자 계좌일 경우 처리
		if (!savingAccount.getAccount().getUser().equals(user)) {
			return Response.Response(HttpStatus.NOT_FOUND, MessageUtil.buildMessage("다른 계정의 계좌입니다.."));
		}

		// 관련 MoneyFlow 조회
		List<MoneyFlow> moneyFlowList = moneyFlowRepository.findBySavingAccount(savingAccount);
		List<SpendingAccount> spendingAccountList = new ArrayList<>();

		// 출금 계좌 삭제
		for (MoneyFlow moneyFlow : moneyFlowList) {
			SpendingAccount spendingAccount = moneyFlow.getSpendingAccount();
			List<SpendingTransaction> spendingTransactionLists = spendingTransactionRepository.findBySpendingAccount(spendingAccount);
			spendingTransactionRepository.deleteAll(spendingTransactionLists);
			List<FixedExpense> fixedExpenseList = fixedExpenseRepository.findBySpendingAccount(spendingAccount);
			fixedExpenseRepository.deleteAll(fixedExpenseList);
			spendingAccountList.add(spendingAccount);
		}

		// moneyFlow 삭제
		moneyFlowRepository.deleteAll(moneyFlowList);

		// 관련 저축 거래 삭제
		List<SavingTransaction> savingTransactionList = savingTransactionRepository.findBySavingAccount(savingAccount);
		savingTransactionRepository.deleteAll(savingTransactionList);

		// 저축 옵션 및 관련 엔티티 삭제
		Optional<SavingOption> savingOption = savingOptionRepository.findBySavingAccount(savingAccount);
		if (savingOption.isPresent()) {
			List<SavingPercent> savingPercentList = savingPercentRepository.findBySavingOption(savingOption.get());
			savingPercentRepository.deleteAll(savingPercentList);

			Optional<MaxMin> maxMinOptional = maxMinRepository.findBySavingOption(savingOption.get());
			maxMinOptional.ifPresent(maxMinRepository::delete);

			List<AbsSaving> absSavingList = absSavingRepository.findBySavingOption(savingOption.get());
			absSavingRepository.deleteAll(absSavingList);

			savingOptionRepository.delete(savingOption.get());
		}

		// SpendingTransaction에서 저축 계좌 참조 삭제
		List<SpendingTransaction> spendingTransactionList = spendingTransactionRepository.findBySavingAccount(savingAccount);
		for (SpendingTransaction spendingTransaction : spendingTransactionList) {
			spendingTransaction.deleteSavingAccount();
		}

		Optional<CumulativeFines> cumulativeFinesOptional = cumulativeFineRepository.findBySavingAccount(savingAccount);
		cumulativeFinesOptional.ifPresent(cumulativeFineRepository::delete);

		// 소비 계좌 삭제
		spendingAccountRepository.deleteAll(spendingAccountList);
		// 최종적으로 저축 계좌 삭제
		savingAccountRepository.delete(savingAccount);

		return Response.Response(HttpStatus.OK, MessageUtil.buildMessage("success"));
	}

	/**
	 * 테스트 페이지용 데이터를 생성하여 반환하는 메서드
	 */
	@Override
	@Transactional
	public ResponseEntity<Object> testPage() {
		List<MoneyFlow> moneyFlowList = moneyFlowRepository.findAll();
		List<TestPageDto> testPageDtoList = new ArrayList<>();
		for (MoneyFlow moneyFlow : moneyFlowList) {
			SavingAccount savingAccount = moneyFlow.getSavingAccount();
			Accounts accountInSavingAccount = savingAccount.getAccount();
			List<SavingTransaction> savingTransactions = savingTransactionRepository.findBySavingAccount(savingAccount);
			SpendingAccount spendingAccount = moneyFlow.getSpendingAccount();
			Accounts accountInSpendingAccount = spendingAccount.getAccount();
			Optional<SavingOption> savingOption = savingOptionRepository.findBySavingAccount(savingAccount);
			if (savingOption.isEmpty()) {
				return Response.Response(HttpStatus.NOT_FOUND, MessageUtil.buildMessage("세이빙 옵션 없음"));
			}
			List<SpendingTransaction> spendingTransactions = spendingTransactionRepository.findBySpendingAccount(spendingAccount);
			List<AbsSaving> absSavings = absSavingRepository.findBySavingOption(savingOption.get());
			List<SavingPercent> savingPercents = savingPercentRepository.findBySavingOption(savingOption.get());
			Optional<MaxMin> maxMinOptional = maxMinRepository.findBySavingOption(savingOption.get());

			// TestPageDto 객체 생성
			TestPageDto testPageDto = TestPageDto.builder()
					.moneyFlow(moneyFlow)
					.absSavings(absSavings)
					.savingPercents(savingPercents)
					.savingOption(savingOption.get())
					.maxMin(maxMinOptional.orElse(null))
					.AccountInSavingAccount(accountInSavingAccount)
					.AccountInSpendingAccount(accountInSpendingAccount)
					.spendingTransactions(spendingTransactions)
					.savingTransactions(savingTransactions)
					.savingAccount(savingAccount)
					.spendingAccount(spendingAccount)
					.build();

			testPageDtoList.add(testPageDto);
		}
		return Response.Response(HttpStatus.OK, testPageDtoList);
	}

	/**
	 * 특정 저축 계좌의 상세 정보를 조회하는 메서드
	 */
	@Override
	@Transactional
	public ResponseEntity<Object> savingDetail(int savingAccountId, CustomUserDetails customUserDetails) {
		// 사용자 정보 조회
		Optional<Users> usersOptional = usersRepository.findById(customUserDetails.getId());
		if (usersOptional.isEmpty()) {
			return Response.Response(HttpStatus.NOT_FOUND, MessageUtil.buildMessage("아이디가 없습니다."));
		}
		Users user = usersOptional.get();

		// 저축 계좌 조회
		Optional<SavingAccount> savingAccountOptional = savingAccountRepository.findById(savingAccountId);
		if (savingAccountOptional.isPresent()) {
			SavingAccount savingAccount = savingAccountOptional.get();
			Optional<CumulativeFines> cumulativeFinesOptional = cumulativeFineRepository.findBySavingAccount(savingAccount);
			CumulativeFines cumulativeFines = null;
			if (cumulativeFinesOptional.isPresent()) {
				cumulativeFines = cumulativeFinesOptional.get();
			}

			// 저축 옵션 및 관련 상세 정보 조회 (절대값/퍼센트 분기)
			Optional<SavingOption> savingOptionOptional = savingOptionRepository.findBySavingAccount(savingAccount);
			SavingOption savingOption = null;
			List<AbsSaving> absSavingList = new ArrayList<>();
			List<SavingPercentDetailDto> savingPercentDetailDtos = new ArrayList<>();
			MaxMin maxMin = null;

			if (savingOptionOptional.isPresent()) {
				savingOption = savingOptionOptional.get();

				switch (savingOption.getSavingType()) {
					// 절대값 방식일 경우
					case 0:
						absSavingList = absSavingRepository.findBySavingOption(savingOption);
						break;
					// 퍼센트 방식일 경우
					case 1:
						List<SavingPercent> savingPercentList = savingPercentRepository.findBySavingOption(savingOption);
						for (SavingPercent savingPercent : savingPercentList) {
							SavingPercentDetailDto savingPercentDetailDto = SavingPercentDetailDto.builder()
									.id(savingPercent.getId())
									.tag(savingPercent.getSobiTag().getName())
									.percent(savingPercent.getPercent())
									.build();
							savingPercentDetailDtos.add(savingPercentDetailDto);
						}
						Optional<MaxMin> maxMinOptional = maxMinRepository.findBySavingOption(savingOption);
						maxMin = maxMinOptional.orElse(null);
						break;
				}
			}

			// 계좌 생성 후 경과 일수 계산
			int daysPassed = (int) ChronoUnit.DAYS.between(savingAccount.getCreatedAt(), LocalDateTime.now());

			// SavingDetail DTO 생성
			SavingDetail savingDetail = SavingDetail.builder()
					.accountNumber(savingAccount.getAccountNumber())
					.monthFines(savingAccount.getMonthFines())
					.balance(savingAccount.getAccount().getBalance())
					.bank(savingAccount.getAccount().getBank())
					.misugeum(savingAccount.getMisugeum())
					.cumulativeFine(cumulativeFines)
					.maxMin(maxMin)
					.daysPassed(daysPassed)
					.absSaving(absSavingList)
					.savingDetails(savingPercentDetailDtos)
					.savingType(savingOption.getSavingType())
					.build();

			return Response.Response(HttpStatus.OK, savingDetail);
		}
		return Response.Response(HttpStatus.NOT_FOUND, MessageUtil.buildMessage("계좌 없음"));
	}

	/**
	 * 지출 거래에 따른 저축 계산 상세 내역 조회 메서드
	 */
	@Override
	@Transactional
	public ResponseEntity<Object> calculationDetail(CustomUserDetails customUserDetails) {
		// 사용자 정보 조회
		Optional<Users> usersOptional = usersRepository.findById(customUserDetails.getId());
		if (usersOptional.isEmpty()) {
			return Response.Response(HttpStatus.NOT_FOUND, MessageUtil.buildMessage("아이디가 없습니다."));
		}
		Users user = usersOptional.get();
		List<SpendingTransaction> spendingTransactions = getSpendingTransactions(user);
		List<CalculatedSpendingTransactionDto> calculatedSpendingTransactionDtos = new ArrayList<>();

		// 사용자 저축 계좌 조회
		Optional<SavingAccount> savingAccountOptional = savingAccountRepository.findByUser(user);
		if (savingAccountOptional.isPresent()) {
			SavingAccount savingAccount = savingAccountOptional.get();
			Optional<CumulativeFines> cumulativeFinesOptional = cumulativeFineRepository.findBySavingAccount(savingAccount);
			if (cumulativeFinesOptional.isEmpty()) {
				return Response.Response(HttpStatus.NOT_FOUND, MessageUtil.buildMessage("누적벌금 테이블이 없습니다."));
			}
			CumulativeFines cumulativeFines = cumulativeFinesOptional.get();

			Optional<SavingOption> savingOptionOptional = savingOptionRepository.findBySavingAccount(savingAccount);
			SavingOption savingOption = null;
			MaxMin maxMin = null;

			if (savingOptionOptional.isPresent()) {
				savingOption = savingOptionOptional.get();

				switch (savingOption.getSavingType()) {
					// 절대값 방식일 경우
					case 0:
						List<AbsSaving> absSavings = absSavingRepository.findBySavingOption(savingOption);
						for (SpendingTransaction spendingTransaction : spendingTransactions) {
							if (spendingTransaction.getCategory().equals("MMM")) continue;

							long spendingAmount = spendingTransaction.getAmount();
							AbsSaving absSaving = null;
							long calculatedAmount = 0;

							// 절대값 방식의 3가지 조건 비교
							long maxAmount1 = absSavings.get(0).getMaxAmount();
							boolean activate1 = absSavings.get(0).isActive();
							long savingAmount1 = absSavings.get(0).getSavingAmount();

							long maxAmount2 = absSavings.get(1).getMaxAmount();
							boolean activate2 = absSavings.get(1).isActive();
							long savingAmount2 = absSavings.get(1).getSavingAmount();

							long maxAmount3 = absSavings.get(2).getMaxAmount();
							boolean activate3 = absSavings.get(2).isActive();
							long savingAmount3 = absSavings.get(2).getSavingAmount();

							if (spendingAmount >= maxAmount3 && activate3) {
								absSaving = absSavings.get(2);
								calculatedAmount = savingAmount3;
							} else if (spendingAmount >= maxAmount2 && activate2) {
								absSaving = absSavings.get(1);
								calculatedAmount = savingAmount2;
							} else if (spendingAmount >= maxAmount1 && activate1) {
								absSaving = absSavings.get(0);
								calculatedAmount = savingAmount1;
							}

							CalculatedSpendingTransactionDto calculatedSpendingTransactionDto = CalculatedSpendingTransactionDto.builder()
									.absSavings(absSaving)
									.item(spendingTransaction.getItem())
									.savingType(savingOption.getSavingType())
									.spendingAccountNumber(spendingTransaction.getSpendingAccount().getAccountNumber())
									.calculatedSpending(calculatedAmount)
									.amount(spendingTransaction.getAmount())
									.category(spendingTransaction.getCategory())
									.createdAt(spendingTransaction.getCreatedAt())
									.build();

							calculatedSpendingTransactionDtos.add(calculatedSpendingTransactionDto);
						}
						break;
					// 퍼센트 방식일 경우
					case 1:
						List<SavingPercent> savingPercentList = savingPercentRepository.findBySavingOption(savingOption);
						Optional<MaxMin> maxMinOptional = maxMinRepository.findBySavingOption(savingOption);
						Map<String, Integer> savingPercents = new HashMap<>();
						Map<String, SavingPercent> savingPercentMap = new HashMap<>();

						if (maxMinOptional.isEmpty()) {
							return Response.Response(HttpStatus.NOT_FOUND, MessageUtil.buildMessage("maxmin이 없습니다."));
						}
						maxMin = maxMinOptional.get();

						for (SavingPercent sp : savingPercentList) {
							savingPercentMap.put(sp.getSobiTag().getName(), sp);
						}

						for (SpendingTransaction spendingTransaction : spendingTransactions) {
							if (spendingTransaction.getCategory().equals("MMM")) continue;
							long calculatedAmount = 0;
							calculatedAmount = SavingCalculator.perSave(savingPercentList, maxMin, spendingTransaction);
							CalculatedSpendingTransactionDto calculatedSpendingTransactionDto = CalculatedSpendingTransactionDto.builder()
									.savingPercent(savingPercentMap.get(spendingTransaction.getCategory()))
									.item(spendingTransaction.getItem())
									.savingType(savingOption.getSavingType())
									.spendingAccountNumber(spendingTransaction.getSpendingAccount().getAccountNumber())
									.calculatedSpending(calculatedAmount)
									.amount(spendingTransaction.getAmount())
									.category(spendingTransaction.getCategory())
									.createdAt(spendingTransaction.getCreatedAt())
									.build();

							calculatedSpendingTransactionDtos.add(calculatedSpendingTransactionDto);
						}
						break;
				}
			}
		}
		return Response.Response(HttpStatus.OK, calculatedSpendingTransactionDtos);
	}

	@Override
	@Transactional
	public ResponseEntity<Object> updateSavingPercent(SavingPercentUpdateDto savingPercentUpdateDto, CustomUserDetails customUserDetails) {
		// 사용자 정보 조회
		Optional<Users> usersOptional = usersRepository.findById(customUserDetails.getId());
		if (usersOptional.isEmpty()) {
			return Response.Response(HttpStatus.NOT_FOUND, MessageUtil.buildMessage("아이디가 없습니다."));
		}
		Users user = usersOptional.get();

		// 업데이트 내용
		List<SavingPercentDetailDto> savingPercentDetailDtoList = savingPercentUpdateDto.getSavingPercentDetails();

		// 기존 퍼센트 업데이트
		for (SavingPercentDetailDto dto : savingPercentDetailDtoList) {
			Optional<SavingPercent> savingPercentOptional = savingPercentRepository.findById(dto.getId());
			if (savingPercentOptional.isEmpty() || savingPercentOptional.get().getPercent() == dto.getPercent()) continue;
			SavingPercent savingPercent = savingPercentOptional.get();
			savingPercent.updatePercent(dto.getPercent());
		}

		return Response.Response(HttpStatus.OK, MessageUtil.buildMessage("success"));
	}

	@Override
	@Transactional
	public ResponseEntity<Object> updateAbsSaving(AbsSavingUpdateRequestDto absSavingUpdateRequestDto, CustomUserDetails customUserDetails) {
		// 사용자 정보 조회
		Optional<Users> usersOptional = usersRepository.findById(customUserDetails.getId());
		if (usersOptional.isEmpty()) {
			return Response.Response(HttpStatus.NOT_FOUND, MessageUtil.buildMessage("아이디가 없습니다."));
		}
		Users user = usersOptional.get();

		List<AbsSavingDto> absSavingDtoList = absSavingUpdateRequestDto.getAbsSavingDtoList();

		for (AbsSavingDto absSavingDto : absSavingDtoList) {
			Optional<AbsSaving> absSavingOptional = absSavingRepository.findById(absSavingDto.getId());
			if (absSavingOptional.isEmpty()) continue;
			AbsSaving absSaving = absSavingOptional.get();
			if (absSaving.isActive() == absSavingDto.isActive() && absSaving.getSavingAmount() == absSavingDto.getSavingAmount()) continue;
			absSaving.update(absSavingDto.getSavingAmount(), absSavingDto.isActive());
		}

		return Response.Response(HttpStatus.OK, MessageUtil.buildMessage("success"));
	}
}
