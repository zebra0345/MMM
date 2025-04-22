package org.ssafy.tmt.api.service.spending;


import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.ssafy.tmt.api.dto.transaction.FixedExpenseDto;
import org.ssafy.tmt.api.dto.transaction.SpendingWithSavingDto;
import org.ssafy.tmt.api.entity.account.SavingAccount;
import org.ssafy.tmt.api.entity.account.SpendingAccount;
import org.ssafy.tmt.api.entity.saving.*;
import org.ssafy.tmt.api.entity.spending.DailyReport;
import org.ssafy.tmt.api.entity.spending.DailySpending;
import org.ssafy.tmt.api.entity.spending.FixedExpense;
import org.ssafy.tmt.api.entity.transaction.SpendingTransaction;
import org.ssafy.tmt.api.entity.user.Users;
import org.ssafy.tmt.api.repository.accounts.SavingAccountRepository;
import org.ssafy.tmt.api.repository.accounts.SpendingAccountRepository;
import org.ssafy.tmt.api.repository.saving.*;
import org.ssafy.tmt.api.repository.spending.DailyReportRepository;
import org.ssafy.tmt.api.repository.spending.FixedExpenseRepository;
import org.ssafy.tmt.api.repository.transaction.SpendingTransactionRepository;
import org.ssafy.tmt.api.repository.users.UsersRepository;
import org.ssafy.tmt.api.request.spending.FixedExpenseCreateRequest;
import org.ssafy.tmt.api.request.spending.FixedExpenseDeleteRequest;
import org.ssafy.tmt.api.response.spending.DailyReportResponse;
import org.ssafy.tmt.api.response.spending.FixedExpenseResponse;
import org.ssafy.tmt.config.security.CustomUserDetails;
import org.ssafy.tmt.util.MessageUtil;
import org.ssafy.tmt.util.Response;
import org.ssafy.tmt.util.SavingCalculator;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class SpendingServiceImpl implements SpendingService {

    private final UsersRepository usersRepository;
    private final SavingAccountRepository savingAccountRepository;
    private final SpendingTransactionRepository spendingTransactionRepository;
    private final SavingOptionRepository savingOptionRepository;
    private final AbsSavingRepository absSavingRepository;
    private final MaxMinRepository maxMinRepository;
    private final SavingPercentRepository savingPercentRepository;
    private final SpendingAccountRepository spendingAccountRepository;
    private final FixedExpenseRepository fixedExpenseRepository;
    private final DailyReportRepository dailyReportRepository;

    @Override
    @Transactional(readOnly = true)
    public ResponseEntity<Object> getDailyReport(CustomUserDetails userDetails) {
        // 사용자 정보 가져오기
        Users user = usersRepository.findByEmail(userDetails.getEmail())
                .orElseThrow(() -> new UsernameNotFoundException("회원을 찾을 수 없습니다."));

        // 어제 오후 11시부터 오늘 오후 10시59분까지
        LocalDateTime start = LocalDateTime.now().minusDays(1).toLocalDate().atTime(23, 0, 0);
        LocalDateTime end = LocalDateTime.now().toLocalDate().atTime(22, 59, 59);

        // 사용자의 당일 소비내역 전체 가져오기
        List<SpendingTransaction> spendingTransactions = spendingTransactionRepository.findByUserAndCreatedAtBetweenAndCategoryNot(user, start, end, "MMM");

        // 저축 계좌 조회
        SavingAccount savingAccount = savingAccountRepository.findByUser(user)
                .orElseThrow(() -> new EntityNotFoundException("사용자의 벌금계좌를 찾을 수 없습니다."));

        // response
        long totalSpendingAmount = 0; // 오늘의 소비 총액
        long totalSavingAmount = 0; // 오늘의 저축 총액

        List<SpendingWithSavingDto> dtos = new ArrayList<>();
        SavingOption savingOption = savingOptionRepository.findBySavingAccount(savingAccount)
                .orElseThrow(() -> new EntityNotFoundException("해당 저축 계좌에 연결된 저축 옵션을 찾을 수 없습니다."));

        // 저축방식에 따른 저축액 계산
        int savingType = savingOption.getSavingType();
        List<AbsSaving> absSavings = null;
        List<SavingPercent> savingPercentList = new ArrayList<>();
        MaxMin maxMin = null;

        if (savingType == 0) {
            absSavings = absSavingRepository.findBySavingOption(savingOption);
        } else if (savingType == 1) {
            savingPercentList = savingPercentRepository.findBySavingOption(savingOption);
            maxMin = maxMinRepository.findBySavingOption(savingOption).orElse(null);
        }

        for (SpendingTransaction spendingTransaction : spendingTransactions) {
            long savingAmount = 0; // 소비금액에 따른 저축액

            if (savingType == 0) {
                savingAmount = SavingCalculator.absSave(absSavings, spendingTransaction);
            } else if (savingType == 1) {
                savingAmount = SavingCalculator.perSave(savingPercentList, maxMin, spendingTransaction);
            } else {
                throw new IllegalArgumentException("지원하지 않는 저축 방식입니다.");
            }

            dtos.add(getSpendingWithSavingDto(spendingTransaction, savingAmount));
            totalSpendingAmount += spendingTransaction.getAmount();
            totalSavingAmount += savingAmount;
        }

        DailyReportResponse response = new DailyReportResponse(dtos, totalSpendingAmount, totalSavingAmount);
        return Response.Response(HttpStatus.OK, response);
    }

    @Override
//    @Transactional(readOnly = true)
    @Transactional
    public ResponseEntity<Object> getDailyReportByDate(CustomUserDetails userDetails, LocalDate date) {
        // 사용자 정보 가져오기
        Users user = usersRepository.findByEmail(userDetails.getEmail())
                .orElseThrow(() -> new UsernameNotFoundException("회원을 찾을 수 없습니다."));

//        DailyReport dailyReport = dailyReportRepository.findByUsersAndDailyReportDate(user, date)
//                .orElseThrow(() -> new EntityNotFoundException("해당 일자의 데일리 리포트를 찾을 수 없습니다."));

        // 과거 데이터 저장용 (임시)
        DailyReport dailyReport = dailyReportRepository.findByUsersAndDailyReportDate(user, date)
                .orElseGet(() -> {
                    // 데일리 리포트 없으면 생성
                    createDailyReport(user, date);
                    // 생성한 거 바로 조회
                    return dailyReportRepository.findByUsersAndDailyReportDate(user, date)
                            .orElseThrow(() -> new EntityNotFoundException("리포트를 생성했지만 리포트를 가져오지 못했습니다."));
                });

        // dto 변환
        List<SpendingWithSavingDto> dtos = new ArrayList<>();
        for (DailySpending dailySpending : dailyReport.getSpendingList()) {
            SpendingWithSavingDto dto = SpendingWithSavingDto.builder()
                    .id(dailySpending.getId())
                    .item(dailySpending.getItem())
                    .spendingAmount(dailySpending.getAmount())
                    .savingAmount(dailySpending.getSavingAmount())
                    .createdAt(dailySpending.getCreatedAt())
                    .build();
            dtos.add(dto);
        }
        DailyReportResponse response = new DailyReportResponse(dtos, dailyReport.getTotalSpendingAmount(), dailyReport.getTotalSavingAmount());
        return Response.Response(HttpStatus.OK, response);
    }

    @Scheduled(cron = "0 30 23 * * *") // 매일 오후 11시 30분 실행
    @Transactional
    public void createDailyReportAllUsers() {
        log.info("데일리 리포트 생성 스케줄러 실행 - {}", LocalDateTime.now());

        LocalDate today = LocalDate.now();

        List<Users> allUsers = usersRepository.findAll();
        for (Users user : allUsers) {
            try {
                createDailyReport(user, today);
            } catch (Exception e) {
                log.error("사용자 {} 데일리 리포트 생성 실패: {}", user.getEmail(), e.getMessage());
            }
        }

        log.info("데일리 리포트 생성 스케줄러 완료 - 성공");
    }

    @Transactional
    public void createDailyReport(Users users, LocalDate date) {
        if (dailyReportRepository.findByUsersAndDailyReportDate(users, date).isPresent()) {
            log.info("사용자 {}의 {} 리포트가 이미 존재합니다.", users.getEmail(), date);
            return;
        }

        // 해당 날짜의 전날 오후 11시부터 해당 날짜 오후 10시 59분까지
        LocalDateTime start = date.minusDays(1).atTime(23, 0, 0);
        LocalDateTime end = date.atTime(22, 59, 59);

        // 해당 기간의 소비 트랜잭션 조회
        List<SpendingTransaction> spendingTransactions =
                spendingTransactionRepository.findByUserAndCreatedAtBetweenAndCategoryNot(
                        users, start, end, "MMM");

        // 트랜잭션이 없으면 리포트 생성하지 않음
        if (spendingTransactions.isEmpty()) {
            log.info("사용자 {}의 {} 소비 내역이 없어 리포트를 생성하지 않습니다.", users.getEmail(), date);
            return;
        }

        // 저축 계좌 및 옵션 조회
        SavingAccount savingAccount = savingAccountRepository.findByUser(users)
                .orElseThrow(() -> new EntityNotFoundException("사용자의 벌금계좌를 찾을 수 없습니다."));

        SavingOption savingOption = savingOptionRepository.findBySavingAccount(savingAccount)
                .orElseThrow(() -> new EntityNotFoundException("해당 저축 계좌에 연결된 저축 옵션을 찾을 수 없습니다."));

        // 저축 방식에 따른 저축액 계산 준비
        int savingType = savingOption.getSavingType();
        List<AbsSaving> absSavings = null;
        List<SavingPercent> savingPercentList = new ArrayList<>();
        MaxMin maxMin = null;

        if (savingType == 0) {
            absSavings = absSavingRepository.findBySavingOption(savingOption);
        } else if (savingType == 1) {
            savingPercentList = savingPercentRepository.findBySavingOption(savingOption);
            maxMin = maxMinRepository.findBySavingOption(savingOption).orElse(null);
        }

        // DailyReport 엔티티 생성
        DailyReport dailyReport = DailyReport.builder()
                .users(users)
                .dailyReportDate(date)
                .totalSpendingAmount(0)
                .totalSavingAmount(0)
                .spendingList(new ArrayList<>())
                .build();

        long totalSpendingAmount = 0;
        long totalSavingAmount = 0;

        // 각 트랜잭션에 대한 상세 내역 생성
        for (SpendingTransaction transaction : spendingTransactions) {
            // 저축액 계산
            long savingAmount = 0;
            if (savingType == 0) {
                savingAmount = SavingCalculator.absSave(absSavings, transaction);
            } else if (savingType == 1) {
                savingAmount = SavingCalculator.perSave(savingPercentList, maxMin, transaction);
            } else {
                throw new IllegalArgumentException("지원하지 않는 저축 방식입니다.");
            }

            // DailySpending 생성
            DailySpending dailySpending = DailySpending.builder()
                    .dailyReport(dailyReport)
                    .category(transaction.getCategory())
                    .item(transaction.getItem())
                    .amount(transaction.getAmount())
                    .spendingAmount(transaction.getAmount())
                    .savingAmount(savingAmount)
                    .createdAt(transaction.getCreatedAt())
                    .build();

            dailyReport.addDailySpending(dailySpending);

            // 총액 누적
            totalSpendingAmount += transaction.getAmount();
            totalSavingAmount += savingAmount;
        }

        // 총액 설정
        dailyReport.setTotalSpendingAmount(totalSpendingAmount);
        dailyReport.setTotalSavingAmount(totalSavingAmount);

        // 저장
        dailyReportRepository.save(dailyReport);
        log.info("사용자 {}의 {} 일일 리포트 생성 완료 - 거래내역 수: {}, 총 지출: {}, 총 저축: {}",
                users.getEmail(), date, dailyReport.getSpendingList().size(),
                totalSpendingAmount, totalSavingAmount);
    }

    @Override
    @Transactional
    public ResponseEntity<Object> getFixedExpense(CustomUserDetails userDetails) {
        // 사용자 정보 가져오기
        Users user = usersRepository.findByEmail(userDetails.getEmail())
                .orElseThrow(() -> new UsernameNotFoundException("회원을 찾을 수 없습니다."));

        // 고정지출 계산 범위
        LocalDate today = LocalDate.now();
        LocalDate threeMonthsAgo = today.minusMonths(3).withDayOfMonth(1); // 3개월 전 1일
        LocalDateTime startDate = threeMonthsAgo.atStartOfDay();
        LocalDateTime endDate = today.withDayOfMonth(1).atStartOfDay().minusNanos(1);

        // 고정지출 찾기
        List<FixedExpenseDto> fixedExpenseDtos = spendingTransactionRepository.findFixedExpenses(user.getId(), startDate, endDate);

        // 기존 고정지출 업데이트 + 새로운 고정지출 생성
        for (FixedExpenseDto fixedExpenseDto : fixedExpenseDtos) {
            // 고정지출의 최근 지출내역 찾기
            SpendingTransaction latestTransactionByFixedExpense = spendingTransactionRepository.findLatestTransactionByFixedExpense(
                    user.getId(), fixedExpenseDto.getAmount(), fixedExpenseDto.getItem(), fixedExpenseDto.getPaymentDate(), startDate, endDate);

            if (latestTransactionByFixedExpense == null) {
                continue;
            }

            SpendingAccount spendingAccount = latestTransactionByFixedExpense.getSpendingAccount();

            // 기존 고정지출 확인
            Optional<FixedExpense> existingFixedExpense = fixedExpenseRepository.findByUserAndAmountAndItem(user, fixedExpenseDto.getAmount(), fixedExpenseDto.getItem());
            if (existingFixedExpense.isPresent()) {
                FixedExpense fixedExpense = existingFixedExpense.get();

                // 마지막 업데이트 이번달인지 확인
                if (!isUpdatedCurrentMonth(fixedExpense)) {
                    SpendingAccount currentSpendingAccount = fixedExpense.getSpendingAccount();
                    // 계좌정보가 바뀌었으면 업데이트
                    if (currentSpendingAccount == null ||
                            !currentSpendingAccount.getAccountNumber().equals(spendingAccount.getAccountNumber())) {
                        fixedExpense.updateAccount(spendingAccount);
                        fixedExpenseRepository.save(fixedExpense);
                    }
                }
            } else {
                // 기존 고정지출에 없으면 새로 생성
                FixedExpense newFixedExpense = FixedExpense.builder()
                        .user(user)
                        .spendingAccount(spendingAccount)
                        .amount(fixedExpenseDto.getAmount())
                        .item(fixedExpenseDto.getItem())
                        .paymentDate(fixedExpenseDto.getPaymentDate())
                        .build();

                fixedExpenseRepository.save(newFixedExpense);
            }
        }

        // 사용자의 모든 고정지출 조회
        List<FixedExpense> fixedExpenses = fixedExpenseRepository.findByUserAndIsDeletedFalse(user);

        // response
        List<FixedExpenseResponse> response = fixedExpenses.stream()
                .map(fixedExpense -> FixedExpenseResponse.fromFixedExpense(fixedExpense))
                .collect(Collectors.toList());
        return Response.Response(HttpStatus.OK, response);
    }

    @Override
    @Transactional
    public ResponseEntity<Object> createFixedExpense(CustomUserDetails userDetails, FixedExpenseCreateRequest request) {
        // user 조회
        Users user = usersRepository.findByEmail(userDetails.getEmail())
                .orElseThrow(() -> new UsernameNotFoundException("회원을 찾을 수 없습니다."));

        FixedExpense newFixedExpense = FixedExpense.builder()
                .user(user)
                .amount(request.getAmount())
                .item(request.getItem())
                .paymentDate(request.getPaymentDate())
                .build();

        if (request.getAccountNumber() != null) {
            SpendingAccount spendingAccount = spendingAccountRepository.findByAccountNumber(request.getAccountNumber())
                    .orElseThrow(() -> new EntityNotFoundException("계좌를 찾을 수 없습니다."));
            newFixedExpense.setSpendingAccount(spendingAccount);
        }
        fixedExpenseRepository.save(newFixedExpense);

        return Response.Response(HttpStatus.CREATED, MessageUtil.buildMessage("고정지출이 생성되었습니다."));
    }

    @Override
    @Transactional
    public ResponseEntity<Object> deleteFixedExpense(CustomUserDetails userDetails, FixedExpenseDeleteRequest request) {
        FixedExpense fixedExpense = fixedExpenseRepository.findById(request.getFixedExpenseId())
                .orElseThrow(() -> new EntityNotFoundException("해당 고정지출을 찾을 수 없습니다."));

        if (!userDetails.getEmail().equals(fixedExpense.getUser().getEmail())) {
            throw new AccessDeniedException("본인의 고정지출만 삭제할 수 있습니다.");
        }

        fixedExpense.setDeleted(true);
        fixedExpenseRepository.save(fixedExpense);

        return Response.Response(HttpStatus.OK, MessageUtil.buildMessage("고정지출이 삭제되었습니다."));
    }

    private SpendingWithSavingDto getSpendingWithSavingDto(SpendingTransaction spendingTransaction, long savingAmount) {
        return SpendingWithSavingDto.builder()
                .id(spendingTransaction.getId())
                .spendingAmount(spendingTransaction.getAmount())
                .savingAmount(savingAmount)
                .item(spendingTransaction.getItem())
                .createdAt(spendingTransaction.getCreatedAt())
                .build();
    }

    // 고정지출이 이번 달에 이미 업데이트 되었는지 확인
    private boolean isUpdatedCurrentMonth(FixedExpense fixedExpense) {
        YearMonth currentYearMonth = YearMonth.now();
        YearMonth updatedYearMonth = YearMonth.from(fixedExpense.getCreatedAt());

        return currentYearMonth.equals(updatedYearMonth);
    }
}