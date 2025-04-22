package org.ssafy.tmt.api.service.transaction;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.ssafy.tmt.api.dto.transaction.ConsumptionList;
import org.ssafy.tmt.api.dto.transaction.MonthlyConsumptionDTO;
import org.ssafy.tmt.api.entity.account.Accounts;
import org.ssafy.tmt.api.entity.account.SpendingAccount;
import org.ssafy.tmt.api.entity.transaction.SpendingTransaction;
import org.ssafy.tmt.api.entity.user.Users;
import org.ssafy.tmt.api.repository.accounts.AccountsRepository;
import org.ssafy.tmt.api.repository.accounts.SpendingAccountRepository;
import org.ssafy.tmt.api.repository.transaction.SpendingTransactionRepository;
import org.ssafy.tmt.api.repository.users.UsersRepository;
import org.ssafy.tmt.config.security.CustomUserDetails;
import org.ssafy.tmt.exception.NoSpendingAccountException;
import org.ssafy.tmt.util.Response;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
public class TransactionServiceImpl implements TransactionService {

	private final SpendingTransactionRepository spendingTransactionRepository;
	private final AccountsRepository accountsRepository;
	private final UsersRepository usersRepository;
	private final SpendingAccountRepository spendingAccountRepository;

	@Override
	@Transactional
	public ResponseEntity<Object> getConsumptionTransaction(CustomUserDetails customUserDetails) {
		LocalDateTime now = LocalDateTime.now();
		LocalDateTime wantTime = now.minusMonths(3);

		Optional<Users> userOpt = usersRepository.findById(customUserDetails.getId());
		if (userOpt.isEmpty()) {
			return Response.Response(HttpStatus.NOT_FOUND, "유저가 없어");
		}

		Users user = userOpt.get();

		// 사용자 기준으로 바로 소비내역 가져옴
		List<SpendingTransaction> spendingTransactions = spendingTransactionRepository
				.findByUserAndCreatedAtAfter(user, wantTime);

		ConsumptionList consumptionList = ConsumptionList.builder()
				.transactions(spendingTransactions)
				.build();

		return Response.Response(HttpStatus.OK, consumptionList);
	}

	@Override
	@Transactional
	public ResponseEntity<Object> getYearlyConsumptionByYear(CustomUserDetails userDetails, int year) {
		final LocalDateTime startOfYear = LocalDateTime.of(year, 1, 1, 0, 0);
		final Users user = usersRepository.findById(userDetails.getId())
				.orElseThrow(() -> new IllegalArgumentException("유저가 존재하지 않습니다."));

		final List<String> fixedCategories = List.of(
				"음식", "과학·기술", "소매", "부동산", "예술·스포츠", "숙박", "수리·개인", "시설관리·임대", "교육", "보건의료"
		);

		List<MonthlyConsumptionDTO> yearlyConsumption = new ArrayList<>();

		for (int i = 0; i < 12; i++) {
			LocalDateTime monthStart = startOfYear.plusMonths(i);
			LocalDateTime monthEnd = monthStart.plusMonths(1);

			// 유저 기준으로 월간 소비내역 조회
			List<SpendingTransaction> monthTransactions = spendingTransactionRepository
					.findByUserAndCreatedAtBetween(user, monthStart, monthEnd);

			// 카테고리별 합계
			Map<String, Long> rawTotals = monthTransactions.stream()
					.collect(Collectors.groupingBy(
							SpendingTransaction::getCategory,
							Collectors.summingLong(SpendingTransaction::getAmount)
					));

			// 누락된 카테고리 0으로 채우기
			Map<String, Long> completeCategoryTotals = new LinkedHashMap<>();
			for (String category : fixedCategories) {
				completeCategoryTotals.put(category, rawTotals.getOrDefault(category, 0L));
			}

			MonthlyConsumptionDTO dto = MonthlyConsumptionDTO.builder()
					.month(monthStart.getMonthValue())
					.categoryTotals(completeCategoryTotals)
					.build();

			yearlyConsumption.add(dto);
		}

		return Response.Response(HttpStatus.OK, yearlyConsumption);
	}


}
