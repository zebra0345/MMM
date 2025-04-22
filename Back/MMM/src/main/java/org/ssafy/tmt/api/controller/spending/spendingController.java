package org.ssafy.tmt.api.controller.spending;

import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.ssafy.tmt.api.request.spending.FixedExpenseCreateRequest;
import org.ssafy.tmt.api.request.spending.FixedExpenseDeleteRequest;
import org.ssafy.tmt.api.service.spending.SpendingService;
import org.ssafy.tmt.config.security.CustomUserDetails;

import java.time.LocalDate;

@RestController
@RequestMapping("/spending")
@RequiredArgsConstructor
public class spendingController {

    private final SpendingService spendingService;

    @GetMapping("/analyze/daily")
    public ResponseEntity<Object> getDailyReport(@AuthenticationPrincipal CustomUserDetails userDetails) {
        return spendingService.getDailyReport(userDetails);
    }

    @GetMapping("daily-report/{date}")
    public ResponseEntity<Object> getDailyReportByDate(@AuthenticationPrincipal CustomUserDetails userDetails,
                                                       @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)LocalDate date) {
        return spendingService.getDailyReportByDate(userDetails, date);
    }

    @GetMapping("/fixed-expense")
    public ResponseEntity<Object> getFixedExpense(@AuthenticationPrincipal CustomUserDetails userDetails) {
        return spendingService.getFixedExpense(userDetails);
    }

    @PostMapping("/fixed-expense")
    public ResponseEntity<Object> createFixedExpense(@AuthenticationPrincipal CustomUserDetails userDetails,
                                                     @RequestBody FixedExpenseCreateRequest request) {
        return spendingService.createFixedExpense(userDetails, request);
    }

    @DeleteMapping("/fixed-expense")
    public ResponseEntity<Object> deleteFixedExpense(@AuthenticationPrincipal CustomUserDetails userDetails,
                                                     @RequestBody FixedExpenseDeleteRequest request) {
        return spendingService.deleteFixedExpense(userDetails, request);
    }
}
