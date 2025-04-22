package org.ssafy.tmt.api.controller.transaction;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.ssafy.tmt.api.service.transaction.TransactionService;
import org.ssafy.tmt.config.security.CustomUserDetails;

@RestController
@RequiredArgsConstructor
@RequestMapping("/transaction")
public class TransactionController {

	private final TransactionService transactionService;

	@GetMapping
	public ResponseEntity<Object> getConsumptionTransaction(@AuthenticationPrincipal CustomUserDetails customUserDetails) {
		return transactionService.getConsumptionTransaction(customUserDetails);
	}

	@GetMapping("/yearly-category")
	public ResponseEntity<Object> getYearlyConsumptionCategorySummary(
			@AuthenticationPrincipal CustomUserDetails customUserDetails,
			@RequestParam int year) {
		return transactionService.getYearlyConsumptionByYear(customUserDetails, year);
	}

}
