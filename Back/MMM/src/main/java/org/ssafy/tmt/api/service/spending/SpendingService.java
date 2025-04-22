package org.ssafy.tmt.api.service.spending;

import org.springframework.http.ResponseEntity;
import org.ssafy.tmt.api.request.spending.FixedExpenseCreateRequest;
import org.ssafy.tmt.api.request.spending.FixedExpenseDeleteRequest;
import org.ssafy.tmt.config.security.CustomUserDetails;

import java.time.LocalDate;

public interface SpendingService {
    ResponseEntity<Object> getDailyReport(CustomUserDetails userDetails);
    ResponseEntity<Object> getDailyReportByDate(CustomUserDetails userDetails, LocalDate date);
    ResponseEntity<Object> getFixedExpense(CustomUserDetails userDetails);
    ResponseEntity<Object> createFixedExpense(CustomUserDetails userDetails, FixedExpenseCreateRequest request);
    ResponseEntity<Object> deleteFixedExpense(CustomUserDetails userDetails, FixedExpenseDeleteRequest request);
}
