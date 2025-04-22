package org.ssafy.tmt.api.service.transaction;

import org.springframework.http.ResponseEntity;
import org.ssafy.tmt.config.security.CustomUserDetails;

public interface TransactionService {
	ResponseEntity<Object> getConsumptionTransaction(CustomUserDetails customUserDetails);
	ResponseEntity<Object> getYearlyConsumptionByYear(CustomUserDetails customUserDetails, int year);
}
